const getToken = () =>
  localStorage.getItem('stockwear_token') || localStorage.getItem('stockline_token');

// Helper for authenticated backend API requests
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(endpoint, {
    ...options,
    headers,
    ...(options.body && typeof options.body !== 'string'
      ? { body: JSON.stringify(options.body) }
      : options.body
      ? { body: options.body }
      : {})
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.message || errorBody.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = errorBody;
    throw err;
  }

  return await res.json();
}

// Check if live backend is online
export const checkBackendHealth = async () => {
  try {
    const res = await fetch('/api/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) return true;
    const fallbackRes = await fetch('/', { method: 'GET' });
    return fallbackRes.ok;
  } catch {
    return false;
  }
};

export const apiClient = {
  // 1. BRANCHES
  getBranches: async () => {
    const res = await apiRequest('/api/branches');
    const list = Array.isArray(res) ? res : res?.data || [];
    return list.map(b => ({
      ...b,
      name: b.name || '',
      address: b.address || '',
      city: b.city || b.address || '',
      region: b.region || '',
      phone: b.phone || ''
    }));
  },

  createBranch: async (branchData) => {
    const payload = {
      name: branchData.name,
      address: branchData.address || [branchData.city, branchData.region].filter(Boolean).join(', ') || null
    };
    return await apiRequest('/api/branches', { method: 'POST', body: payload });
  },

  updateBranch: async (branchData) => {
    const payload = {
      name: branchData.name,
      address: branchData.address || [branchData.city, branchData.region].filter(Boolean).join(', ') || null
    };
    return await apiRequest(`/api/branches/${branchData.branchID}`, {
      method: 'PUT',
      body: payload
    });
  },

  deleteBranch: async (branchID) => {
    await apiRequest(`/api/branches/${branchID}`, { method: 'DELETE' });
    return true;
  },

  // 2. SUPPLIERS
  getSuppliers: async () => {
    const list = await apiRequest('/api/suppliers');
    return Array.isArray(list) ? list : [];
  },

  createSupplier: async (supplierData) => {
    return await apiRequest('/api/suppliers', { method: 'POST', body: supplierData });
  },

  updateSupplier: async (supplierID, supplierData) => {
    return await apiRequest(`/api/suppliers/${supplierID}`, { method: 'PUT', body: supplierData });
  },

  deleteSupplier: async (supplierID) => {
    await apiRequest(`/api/suppliers/${supplierID}`, { method: 'DELETE' });
    return true;
  },

  // 3. PRODUCTS
  getProducts: async () => {
    const products = await apiRequest('/api/products');
    if (Array.isArray(products)) {
      return products.map(p => ({
        ...p,
        unit_cost: parseFloat(p.unit_cost) || 0,
        unit_price: parseFloat(p.unit_price) || 0
      }));
    }
    return [];
  },

  createProduct: async (productData) => {
    const payload = {
      sku: productData.sku,
      name: productData.name,
      unit_cost: parseFloat(productData.unit_cost) || 0,
      unit_price: parseFloat(productData.unit_price) || 0
    };
    const created = await apiRequest('/api/products', { method: 'POST', body: payload });
    return {
      ...created,
      unit_cost: parseFloat(created.unit_cost) || 0,
      unit_price: parseFloat(created.unit_price) || 0
    };
  },

  updateProduct: async (productID, updateData) => {
    const payload = {
      ...(updateData.sku !== undefined ? { sku: updateData.sku } : {}),
      ...(updateData.name !== undefined ? { name: updateData.name } : {}),
      ...(updateData.unit_cost !== undefined ? { unit_cost: parseFloat(updateData.unit_cost) } : {}),
      ...(updateData.unit_price !== undefined ? { unit_price: parseFloat(updateData.unit_price) } : {})
    };
    const updated = await apiRequest(`/api/products/${productID}`, { method: 'PUT', body: payload });
    return {
      ...updated,
      unit_cost: parseFloat(updated.unit_cost) || 0,
      unit_price: parseFloat(updated.unit_price) || 0
    };
  },

  deleteProduct: async (productID) => {
    await apiRequest(`/api/products/${productID}`, { method: 'DELETE' });
    return true;
  },

  // 4. INVENTORY
  getInventory: async (user) => {
    const list = await apiRequest('/api/inventory');
    if (!Array.isArray(list)) return [];
    let invList = list;
    if (user && user.role_name !== 'owner' && user.role_name !== 'admin' && user.branchID) {
      invList = invList.filter(i => i.branchID === user.branchID);
    }
    return invList.map(inv => {
      const product = inv.products || inv.product || {};
      const branch = inv.branch || {};
      const isLow = inv.quantity <= inv.reorder_threshold;
      return {
        ...inv,
        product: {
          ...product,
          unit_cost: parseFloat(product.unit_cost) || 0,
          unit_price: parseFloat(product.unit_price) || 0
        },
        branch,
        isLowStock: isLow,
        stockStatus: inv.quantity === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'
      };
    });
  },

  updateInventoryThreshold: async (inventoryID, newThreshold) => {
    return await apiRequest(`/api/inventory/${inventoryID}`, {
      method: 'PUT',
      body: { reorder_threshold: parseInt(newThreshold, 10) }
    });
  },

  adjustInventoryQuantity: async (inventoryID, delta, reason, user) => {
    // We need the inventory record to get productID and branchID
    const invList = await apiRequest('/api/inventory');
    const item = Array.isArray(invList)
      ? invList.find(i => i.inventoryID === inventoryID)
      : null;

    if (!item) throw new Error('Inventory record not found');

    return await apiRequest('/api/stock-movements', {
      method: 'POST',
      body: {
        productID: item.productID,
        branchID: item.branchID,
        change_qty: delta,
        reason: reason || 'manual_adjustment',
        actor_id: user?.userID || null
      }
    });
  },

  manualAdjustment: async (adjData, user) => {
    return apiClient.adjustInventoryQuantity(
      adjData.inventoryID,
      adjData.delta,
      adjData.reason || 'manual_adjustment',
      user || adjData._user
    );
  },

  // 5. SALES
  createSale: async (salePayload, user) => {
    const payload = {
      branchID: salePayload.branchID,
      cashierID: user?.userID,
      total_amount: salePayload.total_amount,
      items: salePayload.items
    };
    return await apiRequest('/api/sales', { method: 'POST', body: payload });
  },

  processSale: async (saleData, user) => {
    const actor = user || saleData._user;
    if (!actor) throw new Error('User context required for sale processing');
    return apiClient.createSale(saleData, actor);
  },

  getSales: async (user) => {
    const sales = await apiRequest('/api/sales');
    if (!Array.isArray(sales)) return [];
    return sales.map(s => ({
      ...s,
      total_amount: parseFloat(s.total_amount) || 0,
      branchName: s.branch?.name || 'Branch',
      cashierName: s.users ? `${s.users.firstName} ${s.users.lastName}` : 'Cashier'
    }));
  },

  // 6. RESTOCK REQUESTS
  getRestockRequests: async (user) => {
    const list = await apiRequest('/api/restock-requests');
    if (!Array.isArray(list)) return [];
    return list.map(req => ({
      ...req,
      product: req.products || req.product,
      branch: req.branch,
      approverName: req.users ? `${req.users.firstName} ${req.users.lastName}` : null
    }));
  },

  createRestockRequest: async (requestData, user) => {
    const payload = {
      productID: requestData.productID,
      branchID: user?.branchID || requestData.branchID,
      request_qty: parseInt(requestData.request_qty, 10),
      status: 'pending'
    };
    return await apiRequest('/api/restock-requests', { method: 'POST', body: payload });
  },

  approveRestockRequest: async (requestID, supplierID, user) => {
    return await apiRequest(`/api/restock-requests/${requestID}`, {
      method: 'PUT',
      body: { status: 'approved', approved_by: user?.userID, approved_at: new Date().toISOString() }
    });
  },

  // 7. PURCHASE ORDERS
  getPurchaseOrders: async (user) => {
    const orders = await apiRequest('/api/purchase-orders');
    if (!Array.isArray(orders)) return [];
    return orders.map(po => ({
      ...po,
      supplier: po.suppliers || po.supplier,
      branch: po.branch,
      creatorName: po.users ? `${po.users.firstName} ${po.users.lastName}` : 'Admin',
      items: (po.purchase_order_items || po.items || []).map(it => ({
        ...it,
        product: it.products || it.product
      }))
    }));
  },

  createPurchaseOrder: async (poData, user) => {
    const payload = {
      supplierID: poData.supplierID,
      branchID: poData.branchID,
      requestID: poData.requestID || null,
      status: 'open',
      created_by: user?.userID,
      items: poData.items
    };
    return await apiRequest('/api/purchase-orders', { method: 'POST', body: payload });
  },

  approvePurchaseOrder: async (orderID, user) => {
    return await apiRequest(`/api/purchase-orders/${orderID}`, {
      method: 'PUT',
      body: { status: 'approved' }
    });
  },

  // 8. DELIVERIES
  createDelivery: async (deliveryData, user) => {
    const payload = {
      orderID: deliveryData.orderID,
      branchID: deliveryData.branchID,
      received_by: user?.userID,
      items: deliveryData.items
    };
    return await apiRequest('/api/deliveries', { method: 'POST', body: payload });
  },

  receiveDelivery: async (delivData, user) => {
    const actor = user || delivData._user;
    return apiClient.createDelivery(delivData, actor);
  },

  getDeliveries: async (user) => {
    const deliveries = await apiRequest('/api/deliveries');
    if (!Array.isArray(deliveries)) return [];
    return deliveries.map(del => ({
      ...del,
      branch: del.branch,
      receiverName: del.users ? `${del.users.firstName} ${del.users.lastName}` : 'Staff',
      items: (del.delivery_items || del.items || []).map(it => ({
        ...it,
        product: it.products || it.product
      }))
    }));
  },

  // 9. STOCK MOVEMENTS
  getStockMovements: async (user) => {
    const movements = await apiRequest('/api/stock-movements');
    if (!Array.isArray(movements)) return [];
    return movements.map(m => ({
      ...m,
      product: m.products || m.product,
      branch: m.branch,
      actorName: m.users ? `${m.users.firstName} ${m.users.lastName}` : 'System'
    }));
  },

  // 10. USERS (STAFF)
  getUsers: async () => {
    const users = await apiRequest('/api/users');
    if (!Array.isArray(users)) return [];
    return users.map(u => ({
      ...u,
      full_name: u.full_name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      role_name: u.role_name || u.roles?.role_name || 'cashier',
      branchName: u.branchName || u.branch?.name || 'All Branches (Consolidated)'
    }));
  },

  createUser: async (userData) => {
    const created = await apiRequest('/api/users', { method: 'POST', body: userData });
    return {
      ...created,
      full_name: created.full_name || `${created.firstName || ''} ${created.lastName || ''}`.trim(),
      role_name: created.role_name || created.roles?.role_name || userData.role_name,
      branchName: created.branchName || created.branch?.name || 'Assigned Branch'
    };
  },

  updateUser: async (userData) => {
    const updated = await apiRequest(`/api/users/${userData.userID}`, { method: 'PUT', body: userData });
    return {
      ...updated,
      full_name: updated.full_name || `${updated.firstName || ''} ${updated.lastName || ''}`.trim(),
      role_name: updated.role_name || updated.roles?.role_name || userData.role_name,
      branchName: updated.branchName || updated.branch?.name || 'Assigned Branch'
    };
  },

  deleteUser: async (userID) => {
    await apiRequest(`/api/users/${userID}`, { method: 'DELETE' });
    return true;
  },

  // 11. ROLES
  getRoles: async () => {
    const roles = await apiRequest('/api/roles');
    return Array.isArray(roles) ? roles : [];
  }
};
