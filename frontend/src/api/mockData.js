// Seed data mirroring the PostgreSQL/Supabase database schema for Footwear / Shoe Retail

export const INITIAL_BRANCHES = [
  {
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    name: 'Main Branch (Tagbilaran)',
    address: 'CPG Avenue, Tagbilaran City, Bohol',
    created_at: '2026-09-25T18:19:09.813Z'
  },
  {
    branchID: '3bea3251-5e41-4031-bce3-09b92e560afc',
    name: 'Panglao Hub Branch',
    address: 'Alona Beach Rd, Panglao, Bohol',
    created_at: '2026-09-27T16:32:54.280Z'
  },
  {
    branchID: '7d91e84a-9b12-4f33-8a55-22d8471e9a01',
    name: 'Tubigon North Outlet',
    address: 'Commercial Center, Tubigon, Bohol',
    created_at: '2026-09-28T08:00:00.000Z'
  }
];

export const INITIAL_ROLES = [
  { roleID: '7cfba17c-18f9-4586-9d84-d978031720bc', role_name: 'owner' },
  { roleID: 'b4c53a5a-ce2f-4f80-a238-83a1bac4895f', role_name: 'admin' },
  { roleID: 'd668551f-f4a1-407d-9edb-730d4f0ac1ba', role_name: 'branch_manager' },
  { roleID: '1d5f3f6e-e070-479a-af17-6ceb1259906a', role_name: 'cashier' }
];

export const INITIAL_USERS = [
  {
    userID: '6a71139d-b163-481b-8094-19e0c5bfd5db',
    firstName: 'Eleanor',
    middleName: 'M',
    lastName: 'Vance',
    email: 'admin@stockline.com',
    password: 'admin123',
    roleID: '7cfba17c-18f9-4586-9d84-d978031720bc',
    role_name: 'owner',
    branchID: null,
    branchName: 'All Branches (Consolidated)'
  },
  {
    userID: 'b281f9a2-5e40-4911-a831-729d8a17f221',
    firstName: 'Marcus',
    middleName: 'D',
    lastName: 'Holloway',
    email: 'manager.main@stockline.com',
    password: 'manager123',
    roleID: 'd668551f-f4a1-407d-9edb-730d4f0ac1ba',
    role_name: 'branch_manager',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    branchName: 'Main Branch (Tagbilaran)'
  },
  {
    userID: '8f19da21-3c41-4790-b118-918239acbc11',
    firstName: 'Chloe',
    middleName: 'R',
    lastName: 'Tan',
    email: 'manager.panglao@stockline.com',
    password: 'manager123',
    roleID: 'd668551f-f4a1-407d-9edb-730d4f0ac1ba',
    role_name: 'branch_manager',
    branchID: '3bea3251-5e41-4031-bce3-09b92e560afc',
    branchName: 'Panglao Hub Branch'
  },
  {
    userID: '9f97afb0-41dd-4706-a256-dd23da3a9d55',
    firstName: 'Juan',
    middleName: 'P',
    lastName: 'Cruz',
    email: 'cashier@stockline.com',
    password: 'cashier123',
    roleID: '1d5f3f6e-e070-479a-af17-6ceb1259906a',
    role_name: 'cashier',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    branchName: 'Main Branch (Tagbilaran)'
  }
];

export const INITIAL_SUPPLIERS = [
  {
    supplierID: 'supp-001',
    name: 'Nike Philippines Logistics & Distribution',
    contact_info: 'b2b-orders@nikeph.com | +63 2 8845 2200'
  },
  {
    supplierID: 'supp-002',
    name: 'Adidas Pacific Footwear Supply Corp.',
    contact_info: 'wholesale@adidas-pacific.com | +63 2 8912 3340'
  },
  {
    supplierID: 'supp-003',
    name: 'Puma & New Balance Regional Apparel Hub',
    contact_info: 'fulfillment@kicksdist.ph | +63 32 411 9021'
  }
];

export const INITIAL_PRODUCTS = [
  {
    productID: '42b79bee-89ff-4305-99f9-d73848783aea',
    sku: 'SHOE-NK-001',
    name: "Nike Air Jordan 1 Retro High 'Chicago' (US 10.5)",
    category: 'Basketball',
    unit_cost: 5200.00,
    unit_price: 9895.00,
    created_at: '2026-09-25T18:20:49.121Z'
  },
  {
    productID: '51a82fce-9912-4011-ba32-e0192837bc21',
    sku: 'SHOE-NK-002',
    name: "Nike Dunk Low Retro 'Panda' Black/White (US 9.5)",
    category: 'Lifestyle',
    unit_cost: 3100.00,
    unit_price: 5495.00,
    created_at: '2026-09-26T10:15:00.000Z'
  },
  {
    productID: '63c91ebd-a102-4522-cb41-f1293847cd32',
    sku: 'SHOE-AD-003',
    name: 'Adidas Ultraboost Light Running Shoes Core Black (US 10)',
    category: 'Running',
    unit_cost: 4500.00,
    unit_price: 8200.00,
    created_at: '2026-09-26T11:20:00.000Z'
  },
  {
    productID: '74da2fbe-b213-4633-dc52-02394858de43',
    sku: 'SHOE-NB-004',
    name: 'New Balance 550 Vintage White/Green (US 9.0)',
    category: 'Lifestyle',
    unit_cost: 3400.00,
    unit_price: 6295.00,
    created_at: '2026-09-26T12:00:00.000Z'
  },
  {
    productID: '85eb3acf-c324-4744-ed63-13405969ef54',
    sku: 'SHOE-CV-005',
    name: 'Converse Chuck 70 Vintage Canvas High Top Black (US 8.5)',
    category: 'Casual / Canvas',
    unit_cost: 2100.00,
    unit_price: 4190.00,
    created_at: '2026-09-27T09:30:00.000Z'
  },
  {
    productID: '96fc4bda-d435-4855-fe74-24516070fa65',
    sku: 'SHOE-PM-006',
    name: "Puma MB.03 LaMelo Ball 'Toxic' Court Shoes (US 10)",
    category: 'Basketball',
    unit_cost: 4200.00,
    unit_price: 7900.00,
    created_at: '2026-09-27T14:45:00.000Z'
  },
  {
    productID: 'a70d5cef-e546-4966-8f85-35627181ab76',
    sku: 'SHOE-VN-007',
    name: 'Vans Old Skool Pro Skateboarding Shoes Black/White (US 9.5)',
    category: 'Skateboarding',
    unit_cost: 1900.00,
    unit_price: 3798.00,
    created_at: '2026-09-27T16:00:00.000Z'
  },
  {
    productID: 'b81e6dfa-f657-4a77-9096-46738292bc87',
    sku: 'SHOE-AS-008',
    name: 'ASICS GEL-Kayano 30 Stability Road Running Shoes (US 10.5)',
    category: 'Running',
    unit_cost: 5100.00,
    unit_price: 9290.00,
    created_at: '2026-09-27T17:15:00.000Z'
  }
];

export const INITIAL_INVENTORY = [
  // Main Branch (Tagbilaran) inventory
  {
    inventoryID: 'inv-001',
    productID: '42b79bee-89ff-4305-99f9-d73848783aea', // Jordan 1
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 14,
    reorder_threshold: 8,
    updated_at: '2026-09-28T06:00:00.000Z'
  },
  {
    inventoryID: 'inv-002',
    productID: '51a82fce-9912-4011-ba32-e0192837bc21', // Dunk Panda (Low stock!)
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 3, // Low stock triggers automatic restock request
    reorder_threshold: 10,
    updated_at: '2026-09-28T07:15:00.000Z'
  },
  {
    inventoryID: 'inv-003',
    productID: '63c91ebd-a102-4522-cb41-f1293847cd32', // Ultraboost
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 18,
    reorder_threshold: 6,
    updated_at: '2026-09-28T08:00:00.000Z'
  },
  {
    inventoryID: 'inv-004',
    productID: '74da2fbe-b213-4633-dc52-02394858de43', // NB 550
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 12,
    reorder_threshold: 6,
    updated_at: '2026-09-28T08:30:00.000Z'
  },
  {
    inventoryID: 'inv-005',
    productID: '85eb3acf-c324-4744-ed63-13405969ef54', // Chuck 70 (Critical low stock)
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 2,
    reorder_threshold: 8,
    updated_at: '2026-09-28T08:45:00.000Z'
  },
  {
    inventoryID: 'inv-006',
    productID: '96fc4bda-d435-4855-fe74-24516070fa65', // Puma MB.03
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 9,
    reorder_threshold: 5,
    updated_at: '2026-09-28T09:00:00.000Z'
  },
  {
    inventoryID: 'inv-007-mb',
    productID: 'a70d5cef-e546-4966-8f85-35627181ab76', // Vans Old Skool
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 20,
    reorder_threshold: 8,
    updated_at: '2026-09-28T09:10:00.000Z'
  },
  {
    inventoryID: 'inv-008-mb',
    productID: 'b81e6dfa-f657-4a77-9096-46738292bc87', // ASICS Kayano
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    quantity: 11,
    reorder_threshold: 5,
    updated_at: '2026-09-28T09:15:00.000Z'
  },

  // Panglao Hub Branch inventory
  {
    inventoryID: 'inv-007',
    productID: '42b79bee-89ff-4305-99f9-d73848783aea', // Jordan 1
    branchID: '3bea3251-5e41-4031-bce3-09b92e560afc',
    quantity: 8,
    reorder_threshold: 6,
    updated_at: '2026-09-28T06:00:00.000Z'
  },
  {
    inventoryID: 'inv-008',
    productID: '51a82fce-9912-4011-ba32-e0192837bc21', // Dunk Panda
    branchID: '3bea3251-5e41-4031-bce3-09b92e560afc',
    quantity: 16,
    reorder_threshold: 8,
    updated_at: '2026-09-28T07:00:00.000Z'
  },
  {
    inventoryID: 'inv-009',
    productID: '74da2fbe-b213-4633-dc52-02394858de43', // NB 550 (Low stock)
    branchID: '3bea3251-5e41-4031-bce3-09b92e560afc',
    quantity: 2,
    reorder_threshold: 6,
    updated_at: '2026-09-28T08:15:00.000Z'
  },

  // Tubigon North Outlet inventory
  {
    inventoryID: 'inv-010',
    productID: '63c91ebd-a102-4522-cb41-f1293847cd32', // Ultraboost
    branchID: '7d91e84a-9b12-4f33-8a55-22d8471e9a01',
    quantity: 6,
    reorder_threshold: 5,
    updated_at: '2026-09-28T07:30:00.000Z'
  }
];

export const INITIAL_RESTOCK_REQUESTS = [
  {
    requestID: 'req-001',
    productID: '51a82fce-9912-4011-ba32-e0192837bc21', // Dunk Panda
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    request_qty: 24,
    status: 'pending',
    created_at: '2026-09-28T07:15:00.000Z',
    approved_by: null,
    approved_at: null,
    trigger_reason: 'Automated DB Trigger: quantity (3 pairs) <= reorder_threshold (10 pairs)'
  },
  {
    requestID: 'req-002',
    productID: '85eb3acf-c324-4744-ed63-13405969ef54', // Converse Chuck 70
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    request_qty: 20,
    status: 'pending',
    created_at: '2026-09-28T08:45:00.000Z',
    approved_by: null,
    approved_at: null,
    trigger_reason: 'Branch Manager restock request: High weekend foot traffic demand'
  },
  {
    requestID: 'req-003',
    productID: '74da2fbe-b213-4633-dc52-02394858de43', // NB 550
    branchID: '3bea3251-5e41-4031-bce3-09b92e560afc',
    request_qty: 15,
    status: 'approved',
    created_at: '2026-09-27T16:00:00.000Z',
    approved_by: '6a71139d-b163-481b-8094-19e0c5bfd5db',
    approved_at: '2026-09-27T17:30:00.000Z',
    trigger_reason: 'Automated DB Trigger: quantity (2 pairs) <= reorder_threshold (6 pairs)'
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    orderID: 'po-101',
    supplierID: 'supp-003',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    requestID: 'req-003',
    status: 'open',
    created_by: '6a71139d-b163-481b-8094-19e0c5bfd5db',
    created_at: '2026-09-27T18:00:00.000Z',
    items: [
      {
        purchase_itemID: 'poi-001',
        orderID: 'po-101',
        productID: '74da2fbe-b213-4633-dc52-02394858de43',
        quantity_ordered: 15,
        unit_cost: 3400.00
      }
    ]
  },
  {
    orderID: 'po-100',
    supplierID: 'supp-001',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    requestID: null,
    status: 'received',
    created_by: '6a71139d-b163-481b-8094-19e0c5bfd5db',
    created_at: '2026-09-24T14:00:00.000Z',
    items: [
      {
        purchase_itemID: 'poi-000',
        orderID: 'po-100',
        productID: '42b79bee-89ff-4305-99f9-d73848783aea', // Jordan 1
        quantity_ordered: 20,
        unit_cost: 5200.00
      }
    ]
  }
];

export const INITIAL_DELIVERIES = [
  {
    deliveryID: 'del-001',
    orderID: 'po-100',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    received_by: 'b281f9a2-5e40-4911-a831-729d8a17f221',
    received_at: '2026-09-25T14:30:00.000Z',
    items: [
      {
        delivery_itemID: 'deli-001',
        deliveryID: 'del-001',
        productID: '42b79bee-89ff-4305-99f9-d73848783aea',
        quantity_received: 20
      }
    ]
  }
];

export const INITIAL_SALES = [
  {
    saleID: 'sale-001',
    cashierID: '9f97afb0-41dd-4706-a256-dd23da3a9d55',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    total_amount: 15390.00,
    created_at: '2026-09-28T09:12:00.000Z',
    sale_items: [
      {
        itemID: 'si-001',
        saleID: 'sale-001',
        productID: '42b79bee-89ff-4305-99f9-d73848783aea', // Jordan 1
        quantity: 1,
        unit_price: 9895.00
      },
      {
        itemID: 'si-002',
        saleID: 'sale-001',
        productID: '51a82fce-9912-4011-ba32-e0192837bc21', // Dunk Panda
        quantity: 1,
        unit_price: 5495.00
      }
    ]
  },
  {
    saleID: 'sale-002',
    cashierID: '9f97afb0-41dd-4706-a256-dd23da3a9d55',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    total_amount: 8200.00,
    created_at: '2026-09-28T09:45:00.000Z',
    sale_items: [
      {
        itemID: 'si-003',
        saleID: 'sale-002',
        productID: '63c91ebd-a102-4522-cb41-f1293847cd32', // Ultraboost
        quantity: 1,
        unit_price: 8200.00
      }
    ]
  }
];

export const INITIAL_STOCK_MOVEMENTS = [
  {
    movementID: 'mov-001',
    productID: '42b79bee-89ff-4305-99f9-d73848783aea',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    change_qty: 20,
    reference_id: 'del-001',
    created_at: '2026-09-25T14:30:00.000Z',
    reason: 'delivery',
    actor_id: 'b281f9a2-5e40-4911-a831-729d8a17f221',
    actorName: 'Marcus Holloway (Branch Manager)'
  },
  {
    movementID: 'mov-002',
    productID: '42b79bee-89ff-4305-99f9-d73848783aea',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    change_qty: -1,
    reference_id: 'sale-001',
    created_at: '2026-09-28T09:12:00.000Z',
    reason: 'sale',
    actor_id: '9f97afb0-41dd-4706-a256-dd23da3a9d55',
    actorName: 'Juan Cruz (Cashier)'
  },
  {
    movementID: 'mov-003',
    productID: '51a82fce-9912-4011-ba32-e0192837bc21',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    change_qty: -1,
    reference_id: 'sale-001',
    created_at: '2026-09-28T09:12:00.000Z',
    reason: 'sale',
    actor_id: '9f97afb0-41dd-4706-a256-dd23da3a9d55',
    actorName: 'Juan Cruz (Cashier)'
  },
  {
    movementID: 'mov-004',
    productID: '85eb3acf-c324-4744-ed63-13405969ef54',
    branchID: '4359befb-d63a-4ff4-b4ca-605014d39fcb',
    change_qty: -1,
    reference_id: null,
    created_at: '2026-09-28T08:30:00.000Z',
    reason: 'manual_adjustment',
    actor_id: 'b281f9a2-5e40-4911-a831-729d8a17f221',
    actorName: 'Marcus Holloway (Branch Manager)'
  }
];
