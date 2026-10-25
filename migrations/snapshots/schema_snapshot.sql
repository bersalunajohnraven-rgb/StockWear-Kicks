create extension if not exists pgcrypto;
 
-- 1. ROLES
create table roles (
  "roleID"   uuid primary key default gen_random_uuid(),
  role_name  varchar not null unique
);
 
-- 2. BRANCH
create table branch (
  "branchID"  uuid primary key default gen_random_uuid(),
  name        varchar not null,
  address     varchar,
  created_at  timestamptz not null default now()
);
 
-- 3. SUPPLIERS
create table suppliers (
  "supplierID"  uuid primary key default gen_random_uuid(),
  name          varchar not null,
  contact_info  varchar
);
 
-- 4. USERS (depends on roles, branch)
create table users (
  "userID"       uuid primary key default gen_random_uuid(),
  "firstName"    varchar not null,
  "middleName"   varchar,
  "lastName"     varchar not null,
  email          varchar not null unique,
  password_hash  text not null,
  "roleID"       uuid not null references roles("roleID") on delete restrict,
  "branchID"     uuid references branch("branchID") on delete set null,  -- null for admin
  created_at     timestamptz not null default now()
);
 
-- 5. PRODUCTS
create table products (
  "productID"  uuid primary key default gen_random_uuid(),
  sku          varchar not null unique,
  name         varchar not null,
  unit_cost    numeric not null,
  unit_price   numeric not null,
  created_at   timestamptz not null default now()
);
 
-- 6. INVENTORY (depends on products, branch)
create table inventory (
  "inventoryID"      uuid primary key default gen_random_uuid(),
  "productID"        uuid not null references products("productID") on delete cascade,
  "branchID"         uuid not null references branch("branchID") on delete cascade,
  quantity           int not null default 0 check (quantity >= 0),
  reorder_threshold  int not null default 0,
  updated_at         timestamptz not null default now(),
  unique ("productID", "branchID")
);
 
-- 7. SALES (depends on users [cashier], branch)
create table sales (
  "saleID"      uuid primary key default gen_random_uuid(),
  "cashierID"   uuid not null references users("userID") on delete restrict,
  "branchID"    uuid not null references branch("branchID") on delete restrict,
  total_amount  numeric not null default 0,
  created_at    timestamptz not null default now()
);
 
-- 8. SALE_ITEMS (depends on sales, products)
create table sale_items (
  "itemID"     uuid primary key default gen_random_uuid(),
  "saleID"     uuid not null references sales("saleID") on delete cascade,
  "productID"  uuid not null references products("productID") on delete restrict,
  quantity     int not null check (quantity > 0),
  unit_price   numeric not null
);
 
-- 9. RESTOCK_REQUESTS (depends on products, branch, users [approved_by])
create table restock_requests (
  "requestID"  uuid primary key default gen_random_uuid(),
  "productID"  uuid not null references products("productID") on delete restrict,
  "branchID"   uuid not null references branch("branchID") on delete cascade,
  request_qty  int not null check (request_qty > 0),
  status       varchar not null default 'pending'
                 check (status in ('pending', 'approved', 'failed', 'fulfilled')),
  created_at   timestamptz not null default now(),
  approved_by  uuid references users("userID") on delete set null,
  approved_at  timestamptz
);
 
-- 10. PURCHASE_ORDERS (depends on suppliers, branch, restock_requests, users [created_by])
create table purchase_orders (
  "orderID"     uuid primary key default gen_random_uuid(),
  "supplierID"  uuid not null references suppliers("supplierID") on delete restrict,
  "branchID"    uuid not null references branch("branchID") on delete restrict,
  "requestID"   uuid references restock_requests("requestID") on delete set null,
  status        varchar not null default 'open'
                  check (status in ('open', 'partially_received', 'received', 'cancelled')),
  created_by    uuid not null references users("userID") on delete restrict,
  created_at    timestamptz not null default now()
);
 
-- 11. PURCHASE_ORDER_ITEMS (depends on purchase_orders, products)
create table purchase_order_items (
  "purchase_itemID"  uuid primary key default gen_random_uuid(),
  "orderID"          uuid not null references purchase_orders("orderID") on delete cascade,
  "productID"        uuid not null references products("productID") on delete restrict,
  quantity_ordered   int not null check (quantity_ordered > 0),
  unit_cost          numeric not null
);
 
-- 12. DELIVERIES (depends on purchase_orders, branch, users [received_by])
create table deliveries (
  "deliveryID"  uuid primary key default gen_random_uuid(),
  "orderID"     uuid not null references purchase_orders("orderID") on delete restrict,
  "branchID"    uuid not null references branch("branchID") on delete restrict,
  received_by   uuid references users("userID") on delete set null,
  received_at   timestamptz
);
 
-- 13. DELIVERY_ITEM (depends on deliveries, products)
create table delivery_item (
  "delivery_itemID"  uuid primary key default gen_random_uuid(),
  "deliveryID"       uuid not null references deliveries("deliveryID") on delete cascade,
  "productID"        uuid not null references products("productID") on delete restrict,
  quantity_received  int not null check (quantity_received >= 0)
);
 
-- 14. STOCK_MOVEMENTS (depends on products, branch, users [actor_id])
create table stock_movements (
  "movementID"  uuid primary key default gen_random_uuid(),
  "productID"   uuid not null references products("productID") on delete cascade,
  "branchID"    uuid not null references branch("branchID") on delete cascade,
  change_qty    int not null,
  reference_id  uuid,  -- sale_id or delivery_id, no FK enforced (polymorphic)
  created_at    timestamptz not null default now(),
  reason        varchar not null check (reason in ('sale', 'delivery', 'manual_adjustment')),
  actor_id      uuid references users("userID") on delete set null
);
 
-- =========================================================
-- Indexes on FK columns (Postgres doesn't add these
-- automatically; Supabase's linter will flag missing ones)
-- =========================================================
create index on users ("roleID");
create index on users ("branchID");
create index on inventory ("productID");
create index on inventory ("branchID");
create index on sales ("cashierID");
create index on sales ("branchID");
create index on sale_items ("saleID");
create index on sale_items ("productID");
create index on restock_requests ("productID");
create index on restock_requests ("branchID");
create index on restock_requests (approved_by);
create index on purchase_orders ("supplierID");
create index on purchase_orders ("branchID");
create index on purchase_orders ("requestID");
create index on purchase_orders (created_by);
create index on purchase_order_items ("orderID");
create index on purchase_order_items ("productID");
create index on deliveries ("orderID");
create index on deliveries ("branchID");
create index on deliveries (received_by);
create index on delivery_item ("deliveryID");
create index on delivery_item ("productID");
create index on stock_movements ("productID");
create index on stock_movements ("branchID");
create index on stock_movements (actor_id);