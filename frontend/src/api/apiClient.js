import {
  INITIAL_BRANCHES,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_RESTOCK_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_DELIVERIES,
  INITIAL_SALES,
  INITIAL_STOCK_MOVEMENTS
} from './mockData';

const STORAGE_KEY = 'stockwear_kicks_shoes_db_v1';
const LEGACY_STORAGE_KEY = 'stockline_shoes_db_v3';

// Helper to get local state or initialize
const getStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage', e);
  }
  const initialState = {
    branches: INITIAL_BRANCHES,
    roles: INITIAL_ROLES,
    users: INITIAL_USERS,
    suppliers: INITIAL_SUPPLIERS,
    products: INITIAL_PRODUCTS,
    inventory: INITIAL_INVENTORY,
    restock_requests: INITIAL_RESTOCK_REQUESTS,
    purchase_orders: INITIAL_PURCHASE_ORDERS,
    deliveries: INITIAL_DELIVERIES,
    sales: INITIAL_SALES,
    stock_movements: INITIAL_STOCK_MOVEMENTS,
    isLiveBackend: false
  };
  saveStoredState(initialState);
  return initialState;
};

const saveStoredState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage', e);
  }
};

// Check if live backend is online
export const checkBackendHealth = async () => {
  try {
    const res = await fetch('/api/branches', { method: 'GET', headers: { 'Accept': 'application/json' } });
    return res.status !== 404 && res.status !== 502 && res.status !== 503;
  } catch {
    return false;
  }
};

export const apiClient = {
  // Reset database state to defaults
  resetState: () => {
    localStorage.removeItem(STORAGE_KEY);
    return getStoredState();
  },

  // 1. BRANCHES
  getBranches: async () => {
    const state = getStoredState();
    return state.branches;
  },

  createBranch: async (branchData) => {
    const state = getStoredState();
    const newBranch = {
      branchID: `branch-${Date.now()}`,
      name: branchData.name,
      address: branchData.address || '',
      created_at: new Date().toISOString()
    };
    state.branches.unshift(newBranch);
    saveStoredState(state);
    return newBranch;
  },

  // 2. PRODUCTS
  getProducts: async () => {
    const state = getStoredState();
    return state.products;
  },

  createProduct: async (productData) => {
    const state = getStoredState();
    const newProduct = {
      productID: `prod-${Date.now()}`,
      sku: productData.sku,
      name: productData.name,
      category: productData.category || 'General',
      unit_cost: parseFloat(productData.unit_cost) || 0,
      unit_price: parseFloat(productData.unit_price) || 0,
      created_at: new Date().toISOString()
    };
    state.products.unshift(newProduct);

    // Automatically create inventory rows for all branches with quantity 0
    state.branches.forEach((b) => {
      state.inventory.push({
        inventoryID: `inv-${Date.now()}-${b.branchID.slice(0, 4)}`,
        productID: newProduct.productID,
        branchID: b.branchID,
        quantity: 0,
        reorder_threshold: 10,
        updated_at: new Date().toISOString()
      });
    });

    saveStoredState(state);
    return newProduct;
  },

  updateProduct: async (productID, updateData) => {
    const state = getStoredState();
    const idx = state.products.findIndex(p => p.productID === productID);
    if (idx === -1) throw new Error('Product not found');
    state.products[idx] = { ...state.products[idx], ...updateData };
    saveStoredState(state);
    return state.products[idx];
  },

  deleteProduct: async (productID) => {
    const state = getStoredState();
    state.products = state.products.filter(p => p.productID !== productID);
    state.inventory = state.inventory.filter(i => i.productID !== productID);
    saveStoredState(state);
    return true;
  },

  // 3. INVENTORY (Filtered by user role & branch)
  getInventory: async (user) => {
    const state = getStoredState();
    let invList = state.inventory;

    // Data isolation: Branch managers & cashiers only see their assigned branch inventory
    if (user && user.role_name !== 'owner' && user.role_name !== 'admin' && user.branchID) {
      invList = invList.filter(i => i.branchID === user.branchID);
    }

    // Enrich with product details and branch details
    return invList.map(inv => {
      const product = state.products.find(p => p.productID === inv.productID) || {};
      const branch = state.branches.find(b => b.branchID === inv.branchID) || {};
      const isLow = inv.quantity <= inv.reorder_threshold;
      return {
        ...inv,
        product,
        branch,
        isLowStock: isLow,
        stockStatus: inv.quantity === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'
      };
    });
  },

  updateInventoryThreshold: async (inventoryID, newThreshold) => {
    const state = getStoredState();
    const item = state.inventory.find(i => i.inventoryID === inventoryID);
    if (item) {
      item.reorder_threshold = parseInt(newThreshold, 10);
      item.updated_at = new Date().toISOString();
      saveStoredState(state);
    }
    return item;
  },

  adjustInventoryQuantity: async (inventoryID, delta, reason, user) => {
    const state = getStoredState();
    const item = state.inventory.find(i => i.inventoryID === inventoryID);
    if (!item) throw new Error('Inventory record not found');

    const newQty = item.quantity + delta;
    if (newQty < 0) throw new Error('Inventory cannot be negative');

    item.quantity = newQty;
    item.updated_at = new Date().toISOString();

    // Trigger Audit Log / Stock Movement
    const movement = {
      movementID: `mov-${Date.now()}`,
      productID: item.productID,
      branchID: item.branchID,
      change_qty: delta,
      reference_id: null,
      created_at: new Date().toISOString(),
      reason: reason || 'manual_adjustment',
      actor_id: user?.userID || null,
      actorName: user ? `${user.firstName} ${user.lastName} (${user.role_name})` : 'System'
    };
    state.stock_movements.unshift(movement);

    // Automated trigger: if newQty <= threshold, flag restock request
    if (newQty <= item.reorder_threshold) {
      const existingReq = state.restock_requests.find(
        r => r.productID === item.productID && r.branchID === item.branchID && r.status === 'pending'
      );
      if (!existingReq) {
        state.restock_requests.unshift({
          requestID: `req-${Date.now()}`,
          productID: item.productID,
          branchID: item.branchID,
          request_qty: Math.max(20, item.reorder_threshold * 2),
          status: 'pending',
          created_at: new Date().toISOString(),
          approved_by: null,
          approved_at: null,
          trigger_reason: `Trigger: Quantity (${newQty}) <= Reorder Threshold (${item.reorder_threshold})`
        });
      }
    }

    saveStoredState(state);
    return item;
  },

  // 4. SALES & POS TRANSACTION WITH CONCURRENCY LOCK SIMULATION
  createSale: async (salePayload, user) => {
    const state = getStoredState();
    const { branchID, items } = salePayload;

    if (!items || items.length === 0) {
      throw new Error('Sale must include at least one item');
    }

    // Step A: Emulate "SELECT ... FOR UPDATE" row-locking validation
    // Verify each item's stock in the specified branch
    for (const item of items) {
      const inv = state.inventory.find(i => i.productID === item.productID && i.branchID === branchID);
      if (!inv) {
        throw new Error(`Item ${item.productName || item.productID} not available at this branch.`);
      }
      if (inv.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName || 'product'}! Available: ${inv.quantity}, Requested: ${item.quantity}.`);
      }
    }

    // Step B: Calculate total and create sale record
    let totalAmount = 0;
    const saleID = `sale-${Date.now()}`;
    const saleItems = items.map((item, idx) => {
      const lineTotal = item.quantity * item.unit_price;
      totalAmount += lineTotal;
      return {
        itemID: `si-${Date.now()}-${idx}`,
        saleID,
        productID: item.productID,
        quantity: item.quantity,
        unit_price: item.unit_price,
        productName: item.productName || 'Product'
      };
    });

    const newSale = {
      saleID,
      cashierID: user.userID,
      cashierName: `${user.firstName} ${user.lastName}`,
      branchID,
      branchName: state.branches.find(b => b.branchID === branchID)?.name || 'Branch',
      total_amount: totalAmount,
      created_at: new Date().toISOString(),
      sale_items: saleItems
    };

    // Step C: Trigger execution — Deduct stock & log stock movements & check threshold
    for (const item of items) {
      const inv = state.inventory.find(i => i.productID === item.productID && i.branchID === branchID);
      inv.quantity -= item.quantity;
      inv.updated_at = new Date().toISOString();

      // Log movement
      state.stock_movements.unshift({
        movementID: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productID: item.productID,
        branchID,
        change_qty: -item.quantity,
        reference_id: saleID,
        created_at: new Date().toISOString(),
        reason: 'sale',
        actor_id: user.userID,
        actorName: `${user.firstName} ${user.lastName} (Cashier)`
      });

      // Low-stock trigger check
      if (inv.quantity <= inv.reorder_threshold) {
        const existingReq = state.restock_requests.find(
          r => r.productID === item.productID && r.branchID === branchID && r.status === 'pending'
        );
        if (!existingReq) {
          state.restock_requests.unshift({
            requestID: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productID: item.productID,
            branchID,
            request_qty: Math.max(25, inv.reorder_threshold * 3),
            status: 'pending',
            created_at: new Date().toISOString(),
            approved_by: null,
            approved_at: null,
            trigger_reason: `Auto Trigger: Sale #${saleID.slice(-6)} depleted stock to ${inv.quantity} <= ${inv.reorder_threshold}`
          });
        }
      }
    }

    state.sales.unshift(newSale);
    saveStoredState(state);
    return newSale;
  },

  getSales: async (user) => {
    const state = getStoredState();
    let sales = state.sales;

    // Role-based data scoping
    if (user.role_name === 'cashier') {
      sales = sales.filter(s => s.cashierID === user.userID);
    } else if (user.role_name === 'branch_manager') {
      sales = sales.filter(s => s.branchID === user.branchID);
    }
    // owner & admin see all sales

    return sales.map(s => {
      const branch = state.branches.find(b => b.branchID === s.branchID);
      const cashier = state.users.find(u => u.userID === s.cashierID);
      return {
        ...s,
        branchName: branch ? branch.name : s.branchName || 'Branch',
        cashierName: cashier ? `${cashier.firstName} ${cashier.lastName}` : s.cashierName || 'Cashier'
      };
    });
  },

  // 5. RESTOCK REQUESTS & PURCHASE ORDER PROCESSING
  getRestockRequests: async (user) => {
    const state = getStoredState();
    let list = state.restock_requests;

    if (user && user.role_name === 'branch_manager' && user.branchID) {
      list = list.filter(r => r.branchID === user.branchID);
    }

    return list.map(req => {
      const product = state.products.find(p => p.productID === req.productID);
      const branch = state.branches.find(b => b.branchID === req.branchID);
      const approver = state.users.find(u => u.userID === req.approved_by);
      return {
        ...req,
        product,
        branch,
        approverName: approver ? `${approver.firstName} ${approver.lastName}` : null
      };
    });
  },

  createRestockRequest: async (requestData, user) => {
    const state = getStoredState();
    const newReq = {
      requestID: `req-${Date.now()}`,
      productID: requestData.productID,
      branchID: user.branchID || requestData.branchID,
      request_qty: parseInt(requestData.request_qty, 10),
      status: 'pending',
      created_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
      trigger_reason: `Manual request by ${user.firstName} ${user.lastName} (${user.role_name})`
    };
    state.restock_requests.unshift(newReq);
    saveStoredState(state);
    return newReq;
  },

  // Stored procedure emulation: Admin approves restock request -> Converts to Supplier Purchase Order
  approveRestockRequest: async (requestID, supplierID, user) => {
    const state = getStoredState();
    const req = state.restock_requests.find(r => r.requestID === requestID);
    if (!req) throw new Error('Restock request not found');

    const product = state.products.find(p => p.productID === req.productID);
    const chosenSupplierID = supplierID || state.suppliers[0]?.supplierID;

    // Update restock request status
    req.status = 'approved';
    req.approved_by = user.userID;
    req.approved_at = new Date().toISOString();

    // Create Purchase Order (Atomic transition)
    const newPO = {
      orderID: `po-${Date.now()}`,
      supplierID: chosenSupplierID,
      branchID: req.branchID,
      requestID: req.requestID,
      status: 'open',
      created_by: user.userID,
      created_at: new Date().toISOString(),
      items: [
        {
          purchase_itemID: `poi-${Date.now()}`,
          orderID: `po-${Date.now()}`,
          productID: req.productID,
          quantity_ordered: req.request_qty,
          unit_cost: product?.unit_cost || 100
        }
      ]
    };
    state.purchase_orders.unshift(newPO);
    saveStoredState(state);
    return { request: req, purchaseOrder: newPO };
  },

  // 6. PURCHASE ORDERS
  getPurchaseOrders: async (user) => {
    const state = getStoredState();
    let orders = state.purchase_orders;

    if (user && user.role_name === 'branch_manager' && user.branchID) {
      orders = orders.filter(o => o.branchID === user.branchID);
    }

    return orders.map(po => {
      const supplier = state.suppliers.find(s => s.supplierID === po.supplierID);
      const branch = state.branches.find(b => b.branchID === po.branchID);
      const creator = state.users.find(u => u.userID === po.created_by);
      const enrichedItems = (po.items || []).map(item => ({
        ...item,
        product: state.products.find(p => p.productID === item.productID)
      }));
      return {
        ...po,
        supplier,
        branch,
        creatorName: creator ? `${creator.firstName} ${creator.lastName}` : 'Admin',
        items: enrichedItems
      };
    });
  },

  // 7. DELIVERIES (Branch Manager receives stock -> triggers inventory increment)
  createDelivery: async (deliveryData, user) => {
    const state = getStoredState();
    const { orderID, branchID, items } = deliveryData;

    const deliveryID = `del-${Date.now()}`;
    const newDelivery = {
      deliveryID,
      orderID,
      branchID,
      received_by: user.userID,
      received_at: new Date().toISOString(),
      items: items.map((it, idx) => ({
        delivery_itemID: `deli-${Date.now()}-${idx}`,
        deliveryID,
        productID: it.productID,
        quantity_received: it.quantity_received
      }))
    };

    // Auto-increment inventory for each received item & log stock movement
    for (const item of items) {
      let inv = state.inventory.find(i => i.productID === item.productID && i.branchID === branchID);
      if (inv) {
        inv.quantity += item.quantity_received;
        inv.updated_at = new Date().toISOString();
      } else {
        inv = {
          inventoryID: `inv-${Date.now()}`,
          productID: item.productID,
          branchID,
          quantity: item.quantity_received,
          reorder_threshold: 10,
          updated_at: new Date().toISOString()
        };
        state.inventory.push(inv);
      }

      // Record stock movement
      state.stock_movements.unshift({
        movementID: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productID: item.productID,
        branchID,
        change_qty: item.quantity_received,
        reference_id: deliveryID,
        created_at: new Date().toISOString(),
        reason: 'delivery',
        actor_id: user.userID,
        actorName: `${user.firstName} ${user.lastName} (Receiving Officer)`
      });
    }

    // Update PO status to received
    const po = state.purchase_orders.find(p => p.orderID === orderID);
    if (po) {
      po.status = 'received';
    }

    state.deliveries.unshift(newDelivery);
    saveStoredState(state);
    return newDelivery;
  },

  getDeliveries: async (user) => {
    const state = getStoredState();
    let dels = state.deliveries;

    if (user && user.role_name === 'branch_manager' && user.branchID) {
      dels = dels.filter(d => d.branchID === user.branchID);
    }

    return dels.map(del => {
      const branch = state.branches.find(b => b.branchID === del.branchID);
      const receiver = state.users.find(u => u.userID === del.received_by);
      const items = (del.items || []).map(it => ({
        ...it,
        product: state.products.find(p => p.productID === it.productID)
      }));
      return {
        ...del,
        branch,
        receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Inventory Staff',
        items
      };
    });
  },

  // 8. STOCK MOVEMENTS (Audit Trail)
  getStockMovements: async (user) => {
    const state = getStoredState();
    let movements = state.stock_movements;

    if (user && user.role_name === 'branch_manager' && user.branchID) {
      movements = movements.filter(m => m.branchID === user.branchID);
    }

    return movements.map(m => {
      const product = state.products.find(p => p.productID === m.productID);
      const branch = state.branches.find(b => b.branchID === m.branchID);
      return {
        ...m,
        product,
        branch
      };
    });
  },

  // 9. SUPPLIERS
  getSuppliers: async () => {
    const state = getStoredState();
    return state.suppliers;
  },

  createSupplier: async (suppData) => {
    const state = getStoredState();
    const newSupp = {
      supplierID: `supp-${Date.now()}`,
      name: suppData.name,
      contact_info: suppData.contact_info || ''
    };
    state.suppliers.push(newSupp);
    saveStoredState(state);
    return newSupp;
  },

  // 10. USERS / STAFF ACCOUNTS
  getUsers: async () => {
    const state = getStoredState();
    return state.users.map(u => ({
      ...u,
      branchName: state.branches.find(b => b.branchID === u.branchID)?.name || 'Consolidated / Global'
    }));
  },

  createUser: async (userData) => {
    const state = getStoredState();
    const newUser = {
      userID: `usr-${Date.now()}`,
      firstName: userData.full_name?.split(' ')[0] || userData.firstName || '',
      middleName: userData.middleName || '',
      lastName: userData.full_name?.split(' ').slice(1).join(' ') || userData.lastName || '',
      full_name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      email: userData.email,
      role_name: userData.role_name || 'cashier',
      branchID: userData.branchID || null,
      branchName: state.branches.find(b => b.branchID === userData.branchID)?.name || 'Consolidated'
    };
    state.users.push(newUser);
    saveStoredState(state);
    return newUser;
  },

  updateUser: async (userData) => {
    const state = getStoredState();
    const idx = state.users.findIndex(u => u.userID === userData.userID);
    if (idx !== -1) {
      state.users[idx] = {
        ...state.users[idx],
        full_name: userData.full_name || state.users[idx].full_name,
        email: userData.email || state.users[idx].email,
        role_name: userData.role_name || state.users[idx].role_name,
        branchID: userData.branchID !== undefined ? userData.branchID : state.users[idx].branchID,
        branchName: state.branches.find(b => b.branchID === userData.branchID)?.name || state.users[idx].branchName,
      };
      saveStoredState(state);
      return state.users[idx];
    }
    throw new Error('User not found');
  },

  updateBranch: async (branchData) => {
    const state = getStoredState();
    const idx = state.branches.findIndex(b => b.branchID === branchData.branchID);
    if (idx !== -1) {
      state.branches[idx] = { ...state.branches[idx], ...branchData };
      saveStoredState(state);
      return state.branches[idx];
    }
    throw new Error('Branch not found');
  },

  // Alias: processSale wraps createSale for App.jsx handlers
  processSale: async (saleData, user) => {
    // saleData may already include user embedded; unwrap
    const actor = user || saleData._user || {
      userID: saleData.cashierID || 'demo-user',
      firstName: 'Demo', lastName: 'User', role_name: 'cashier'
    };
    return apiClient.createSale(saleData, actor);
  },

  // Alias: createPurchaseOrder
  createPurchaseOrder: async (poData, user) => {
    const state = getStoredState();
    const actor = user || { userID: 'demo-user', firstName: 'Demo', lastName: 'User' };
    const newPO = {
      orderID: `po-${Date.now()}`,
      supplierID: poData.supplierID,
      branchID: poData.branchID,
      status: 'open',
      created_by: actor.userID,
      created_at: new Date().toISOString(),
      items: (poData.items || []).map((it, idx) => ({
        purchase_itemID: `poi-${Date.now()}-${idx}`,
        productID: it.productID,
        quantity_ordered: it.quantity_ordered,
        unit_cost: it.unit_cost || 0
      }))
    };
    state.purchase_orders.unshift(newPO);
    saveStoredState(state);
    return newPO;
  },

  // Alias: approvePurchaseOrder (simple status flip)
  approvePurchaseOrder: async (orderID, user) => {
    const state = getStoredState();
    const po = state.purchase_orders.find(p => p.orderID === orderID);
    if (!po) throw new Error('Purchase Order not found');
    po.status = 'approved';
    po.approved_by = user?.userID || null;
    po.approved_at = new Date().toISOString();
    saveStoredState(state);
    return po;
  },

  // Alias: receiveDelivery wraps createDelivery for App.jsx handlers
  receiveDelivery: async (delivData, user) => {
    const actor = user || delivData._user || {
      userID: 'demo-user', firstName: 'Demo', lastName: 'Staff'
    };
    return apiClient.createDelivery(delivData, actor);
  },

  // Alias: manualAdjustment wraps adjustInventoryQuantity
  manualAdjustment: async (adjData, user) => {
    return apiClient.adjustInventoryQuantity(
      adjData.inventoryID,
      adjData.delta,
      adjData.reason || 'manual_adjustment',
      user || adjData._user
    );
  },

  // Reset local state to initial mock data
  resetState: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.error('Error resetting state', e);
    }
  },
};
