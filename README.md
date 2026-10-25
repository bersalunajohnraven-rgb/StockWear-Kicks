## StockWear Kicks — Multi-Branch Retail Inventory and POS Management System

Advanced Database Systems course project.

## Overview

**StockWear Kicks** is a database-backed multi-branch retail inventory, Point of Sale (POS), and supply chain management system tailored specifically for footwear and sneaker retail operations. It centralizes product catalogs, cross-branch shelf stock, cashier sales, vendor purchasing, and delivery records while keeping each branch's stock separately isolated and traceable.

The system prevents stockouts and over-selling by:
- Monitoring shoe inventory levels against branch reorder thresholds.
- Generating automated restock requests when stock drops below threshold.
- Providing a fast, dedicated Sneaker Point-of-Sale (POS) terminal for store cashiers.
- Recording complete stock movement audit trails for sales, shipments, and manual adjustments.
- Recording tamper-proof row-level audit logs on sensitive entities (users, roles, branches, products, suppliers, purchase orders).
- Utilizing row-level concurrency protection (`SELECT ... FOR UPDATE`) and ACID transactions during multi-item checkouts.
- Enforcing branch isolation and role privileges through PostgreSQL Row-Level Security (RLS) policies and JWT-based Role-Based Access Control (RBAC).

---

## Getting Started & Running the Application

### 1. Prerequisites
- **Node.js**: v18 or higher recommended (v20+ supported)
- **npm**: v9 or higher
- **PostgreSQL / Supabase instance**: Cloud PostgreSQL instance configured with schema migrations

### 2. Backend Setup (Node.js + Express 5 + Prisma 6)
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables in backend/.env:
# DATABASE_URL="postgresql://..."
# AUTH_DATABASE_URL="postgresql://..."
# JWT_SECRET="..."
# SEED_ADMIN_PASSWORD="admin123"

# (Optional) Seed initial roles, branch, supplier, product, and admin account
npm run seed

# Start the backend server
npm run dev
```
The backend server runs on `http://localhost:3000` (or the port defined in `backend/.env`).

### 3. Frontend Setup (React 19 + Vite 8 + Tailwind CSS v4)
```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server with API proxying
npm run dev
```
Open your browser at **[http://localhost:5173](http://localhost:5173)**. Requests to `/api/*` are automatically proxied to `http://localhost:3000`.

> **Important**: The backend API must be running for staff authentication and live operational data. If the backend is unreachable, the login screen will notify you that the backend is offline.

---

## Staff Accounts & Login Credentials

Authentication is required to access the system. Each account is assigned a specific role and branch scope:

| Role | Name | Email Address | Branch Scope & Access Level |
|---|---|---|---|
| **Store Owner / Regional Admin** | Eleanor Vance | `admin@stockwearkicks.com` | Global executive access across all branches, catalog editing, restock approval, and database defense panel |
| **Branch Manager** | Marcus Holloway | `manager.main@stockwearkicks.com` | Main Branch (Tagbilaran) inventory, low-stock alerts, restock requests, and delivery receipts |
| **Branch Manager** | Chloe Tan | `manager.panglao@stockwearkicks.com` | Panglao Hub Branch inventory, branch sales logs, and restock requests |
| **Store Cashier** | Juan Cruz | `cashier@stockwearkicks.com` | Sneaker Point-of-Sale (POS) terminal, register checkout, and personal sales receipts |

> **Note**: For security compliance, default passwords have been omitted from this repository. Account credentials and demonstration passwords are provided to the course instructor separately. Running `npm run seed` in `backend/` creates the initial Store Owner account (`admin@stockwearkicks.com`) using `SEED_ADMIN_PASSWORD` from `backend/.env`. Additional staff and branch managers can be created through the **Staff Accounts & Roles** view.

---

## Core Features & Modules

### 👟 Sneaker & Footwear Catalog (`ProductsView`)
- Master footwear catalog with unique SKU identification, supplier unit cost, and retail selling price.
- Pre-seeded with iconic footwear models and sizes across categories:
  - **Basketball**: *Nike Air Jordan 1 Retro High 'Chicago' (US 10.5)*, *Puma MB.03 LaMelo Ball 'Toxic' (US 10)*
  - **Lifestyle**: *Nike Dunk Low Retro 'Panda' (US 9.5)*, *New Balance 550 Vintage White/Green (US 9.0)*
  - **Running**: *Adidas Ultraboost Light Core Black (US 10)*, *ASICS GEL-Kayano 30 Stability (US 10.5)*
  - **Casual / Canvas**: *Converse Chuck 70 Vintage Canvas High Top (US 8.5)*
  - **Skateboarding**: *Vans Old Skool Pro Classic (US 9.5)*

### 💳 Sneaker Point of Sale (POS) Terminal (`POSView`)
- Fast cashier sales terminal designed for retail shoe store checkout.
- Category filter chips (`All`, `Basketball`, `Lifestyle`, `Running`, `Skateboarding`, `Casual / Canvas`).
- Real-time shelf stock counter per branch (`X pairs in stock`) with automated stockout prevention.
- Cart order summary with subtotal calculation, 12% VAT breakdown, cash tendered input, and change calculator.
- Digital sales receipt modal with cashier and branch timestamp tracking.

### 📦 Multi-Branch Inventory Tracking & Restock Triggers (`InventoryView`)
- Real-time stock counts across multiple store branches (Tagbilaran Main Branch, Panglao Hub, Tubigon Outlet).
- Automated restock request generation when shelf quantity falls below reorder thresholds.
- Cross-branch manual adjustments with audit reason logging.

### 📊 Executive & Branch Dashboards (`AdminDashboard`, `ManagerDashboard`)
- **Executive Hub (Owner/Admin)**: Consolidated KPIs across all branches, gross revenue, total pairs on shelf, critical low-stock alerts, and central restock approval queue.
- **Store Hub (Branch Manager)**: Branch-specific metrics, local inventory levels, restock status, and daily register summary.

### 📋 Restock Requests & Purchase Orders (`PurchaseOrdersView`)
- Multi-item Purchase Orders linked to branch restock requests and supplier distributor profiles.
- Automated creation when branch inventory dips below threshold, with owner authorization workflow.

### 🚚 Footwear Shipments & Deliveries (`DeliveriesView`)
- Delivery receiving verification that increments physical branch inventory and logs stock movements.
- Automatic matching and reconciliation with open Purchase Orders.

### 🏭 Footwear Suppliers Management (`SuppliersView`)
- Directory of authorized footwear distributors (Nike Philippines Distribution, Adidas Pacific Supply, Puma & New Balance Hub).
- Supplier contacts, order history, and active procurement links.

### 🏬 Store Branches & Outlets (`BranchesView`)
- Multi-outlet configuration including address, contact information, and branch-specific inventory partitions.

### 👥 Staff Accounts & Roles (`StaffView`)
- Role-Based Access Control (RBAC) management mapping staff members to system roles (`owner`, `admin`, `branch_manager`, `cashier`) and branch assignments.

### 📜 Stock Movement Audit Trail (`AuditTrailView`)
- Complete immutable history of all inventory modifications (Sales, Deliveries, and Manual Adjustments).
- Tracks exact quantity delta, reference document ID, actor name, and timestamp.

### 🛡️ Audit Logging & Tamper-Proof Trail (`Audit Logging`)
- **Row-Level Entity Auditing**: Comprehensive audit logging capturing every `INSERT`, `UPDATE`, and `DELETE` event across sensitive tables (`users`, `roles`, `branch`, `products`, `suppliers`, and `purchase_orders`).
- **Generic Database Trigger (`fn_audit_row_change`)**: Automatically introspects primary keys, computes changed field deltas, redacts sensitive password and token values from payloads while recording changed attributes, and identifies the actor from PostgreSQL session variable `app.current_user_id` (falling back to `current_user`). No-op updates with identical values are skipped.
- **Append-Only Immutability**: Protected by an append-only trigger (`trg_audit_log_prevent_modification`) that prohibits `UPDATE` and `DELETE` actions on `audit_log`, ensuring a tamper-resistant historical record.
- **Restricted Access & RLS**: PostgreSQL Row-Level Security ensures only `owner` and `admin` roles can query audit logs, exposed via the authenticated and role-guarded `GET /api/audit-log` API route.

### 🧾 Consolidated Sales History (`SalesHistoryView`)
- Historical sales transactions filtered by branch, cashier, and date with line-item detail breakdowns.

### 🛡️ Database Engineering Defense Panel (`DatabaseDefenseView`)
Dedicated technical defense console designed for academic course project evaluation and grader inspection:
- **3rd Normal Form (3NF) Normalization**: Elimination of repeating groups and transitive dependencies across `products`, `branch_inventory`, `sales`, and `purchase_orders`.
- **Server-Side PL/pgSQL Triggers**:
  - `trigger_deduct_stock_on_sale`: Atomically decrements `branch_inventory.quantity` on `sale_items` insertion.
  - `trigger_increment_stock_on_delivery`: Automatically increments shelf stock and closes fulfilled Purchase Orders.
  - `trigger_log_stock_movement`: Records audit rows in `stock_movements` on any inventory quantity shift.
  - `trg_audit_<table_name>` (attached to `users`, `roles`, `branch`, `products`, `suppliers`, `purchase_orders`): Invokes `fn_audit_row_change()`, a generic `SECURITY DEFINER` function that captures entity changes, skips zero-difference updates, masks sensitive credentials, and logs the acting user.
  - `trg_audit_log_prevent_modification`: Append-only enforcement trigger on `audit_log` that raises exceptions on any `UPDATE` or `DELETE` attempt, guaranteeing strict audit trail immutability.
- **Stored Procedures**: Procedural logic including `sp_process_sale`, `sp_request_restock`, and `sp_approve_purchase_order` with `BEGIN / EXCEPTION / ROLLBACK` transaction atomicity.
- **Row-Level Concurrency Locking**: `SELECT ... FOR UPDATE` row locks preventing overselling or negative inventory under simultaneous cashier checkouts.
- **PostgreSQL Row-Level Security (RLS)**: Enforces branch isolation so branch managers and cashiers can only access records scoped to their assigned outlet, with dedicated read-only audit logging policies for administrators.
- **Query Optimization & Indexing**: Optimized indexes (`idx_inv_branch`, `idx_sales_branch`, `idx_mvmt_product`, `idx_audit_log_table_record`, `idx_audit_log_changed_at`, `idx_audit_log_changed_by`) eliminating sequential scans, verified via `EXPLAIN ANALYZE`.

---

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React Icons, Oxlint
- **Backend**: Node.js, Express.js 5, Prisma ORM 6
- **Database**: PostgreSQL 15 (Supabase Cloud)
- **Security**: JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC), PostgreSQL Row-Level Security (RLS)

---

## Database Architecture & Migrations

The database migrations are located in the [`migrations/`](./migrations) directory:

- `001_create_branch.sql` — Store outlet entities
- `002_create_roles.sql` — Role definitions (`owner`, `admin`, `branch_manager`, `cashier`)
- `003_create_users.sql` — Staff user profiles mapped to roles and branches
- `004_create_suppliers.sql` — Footwear brand distributors
- `005_create_products.sql` — Product catalog with unique SKUs and pricing
- `006_create_inventory.sql` — Branch-specific stock levels and reorder thresholds
- `007_create_restock_requests.sql` — Automated and manual replenishment tickets
- `008_create_purchase_orders.sql` — Vendor purchase orders
- `009_create_purchase_order_items.sql` — Purchase order line items
- `010_create_deliveries.sql` — Shipment receiving headers
- `011_create_delivery_item.sql` — Delivery line items
- `012_create_sales.sql` — Register sales transactions
- `013_create_sale_items.sql` — Individual footwear sale line items
- `014_create_stock_movements.sql` — Immutable stock audit trail
- `015_security_rbac.sql` — PostgreSQL Row-Level Security (RLS) policies and least-privilege database roles
- `016_audit_log.sql` — Generic row-level audit logging trigger, append-only security, and tamper-proof audit trail

> **Reference Snapshot**: The consolidated full schema reference has been moved to [`migrations/snapshots/schema_snapshot.sql`](./migrations/snapshots/schema_snapshot.sql) outside the numbered migration sequence to maintain strict sequential ordering without duplication.

Prisma schema mappings are maintained in [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).

---

## Backend Authentication and Database Security

Apply [`migrations/015_security_rbac.sql`](./migrations/015_security_rbac.sql) with a database owner to initialize non-login `stockline_app` and `stockline_auth` group roles and enable Row-Level Security (RLS):

- `stockline_auth` can only read credential and role fields needed for authentication.
- `stockline_app` enforces branch isolation policies and write permissions based on staff roles.
- Users authenticate via `POST /api/auth/login` using `{ "email": "...", "password": "..." }`, returning a signed JWT bearer token.
- Protected API routes verify the JWT token via `authenticateUser` and check permissions with `authorizeRoles(...)`.

---

## Contribution Workflow

This repository enforces strict Git hygiene and team collaboration standards:

1. **Branch Isolation**: Direct commits and pushes to `main` are strictly prohibited. All work must be conducted on dedicated task branches branched off the latest `main`:
   - Bug fixes: `fix/<issue-name>` (e.g., `fix/migration-numbering`)
   - New features: `feature/<feature-name>` (e.g., `feature/audit-log-triggers`)
   - Documentation: `docs/<docs-topic>` (e.g., `docs/update-readme`)
2. **Pull Requests (PRs) Only**: All branches must be merged into `main` exclusively via GitHub Pull Requests after automated CI checks and code reviews pass.
3. **Descriptive Commit Prefixes**: Every commit message must use standard conventional prefixes:
   - `feat:` for new capabilities or schema extensions
   - `fix:` for bug fixes and numbering resolutions
   - `chore:` for dependency updates, schema syncs, and tooling
   - `docs:` for documentation updates
   - `refactor:` for code restructuring without behavioral change
4. **Synchronization**: Always execute `git pull origin main` before branching, committing, or pushing to prevent merge conflicts.
