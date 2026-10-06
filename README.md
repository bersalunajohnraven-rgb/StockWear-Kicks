# StockLine Footwear & Kicks — Multi-Branch Retail Inventory and POS Management System

Advanced Database Systems course project.

## Overview

**StockLine Footwear & Kicks** is a database-backed multi-branch retail inventory, Point of Sale (POS), and supply chain management system tailored specifically for footwear and sneaker retail operations. It centralizes product catalogs, cross-branch shelf stock, cashier sales, vendor purchasing, and delivery records while keeping each branch's stock separately isolated and traceable.

The system prevents stockouts and over-selling by:
- Monitoring shoe inventory levels against branch reorder thresholds.
- Generating automated restock requests when stock drops below threshold.
- Providing a fast, dedicated Sneaker Point-of-Sale (POS) terminal for store cashiers.
- Recording complete stock movement audit trails for sales, shipments, and manual adjustments.
- Utilizing row-level concurrency protection and ACID transactions during multi-item checkouts.

---

## Getting Started & Running the Application

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Frontend Setup (React + Vite)
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```
Open your browser at **[http://localhost:5173](http://localhost:5173)**.

### 3. Backend Setup (Node.js + Express + Prisma)
```bash
# In a separate terminal, navigate to the backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client & start the server
npm run dev
```
The backend server runs on `http://localhost:3000` (or the port defined in `backend/.env`).

> **Note**: If the backend server is offline or still starting up, the frontend automatically falls back to local authenticated state, allowing complete end-to-end evaluation of the UI, POS terminal, and inventory management features.

---

## Staff Accounts & Login Credentials

Authentication is required to access the system. Each account is assigned a specific role and branch scope:

| Role | Name | Email Address | Password | Branch Scope & Access Level |
|---|---|---|---|---|
| **Store Owner** | Eleanor Vance | `admin@stockline.com` | `admin123` | Regional executive access across all branches, global catalog editing, and PO approval |
| **Branch Manager** | Marcus Holloway | `manager.main@stockline.com` | `manager123` | Main Branch (Tagbilaran) inventory, low-stock alerts, restock requests, and delivery receipts |
| **Branch Manager** | Chloe Tan | `manager.panglao@stockline.com` | `manager123` | Panglao Hub Branch inventory, branch sales logs, and restock requests |
| **Store Cashier** | Juan Cruz | `cashier@stockline.com` | `cashier123` | Sneaker Point-of-Sale (POS) register and branch sales receipts |

---

## Core Features & Modules

### 👟 Sneaker & Footwear Catalog
- Master footwear catalog with unique SKU identification, supplier unit cost, and retail selling price.
- Pre-seeded with iconic footwear models and sizes across categories:
  - **Basketball**: *Nike Air Jordan 1 Retro High 'Chicago' (US 10.5)*, *Puma MB.03 LaMelo Ball 'Toxic' (US 10)*
  - **Lifestyle**: *Nike Dunk Low Retro 'Panda' (US 9.5)*, *New Balance 550 Vintage White/Green (US 9.0)*
  - **Running**: *Adidas Ultraboost Light Core Black (US 10)*, *ASICS GEL-Kayano 30 Stability (US 10.5)*
  - **Casual / Canvas**: *Converse Chuck 70 Vintage Canvas High Top (US 8.5)*
  - **Skateboarding**: *Vans Old Skool Pro Classic (US 9.5)*

### 💳 Sneaker Point of Sale (POS) Terminal
- Fast cashier sales terminal designed for retail shoe store checkout.
- Category filter chips (`All`, `Basketball`, `Lifestyle`, `Running`, `Skateboarding`, `Casual / Canvas`).
- Real-time shelf stock counter per branch (`X pairs in stock`) with automated stockout prevention.
- Cart order summary with subtotal calculation, 12% VAT breakdown, cash tendered input, and change calculator.
- Digital sales receipt modal with cashier and branch timestamp tracking.

### 📦 Multi-Branch Inventory Tracking & Restock Triggers
- Real-time stock counts across multiple store branches (Tagbilaran Main Branch, Panglao Hub, Tubigon Outlet).
- Automated restock request generation when shelf quantity falls below reorder thresholds.
- Cross-branch manual adjustments with audit reason logging.

### 🚚 Suppliers, Purchase Orders & Receiving
- Footwear vendor logistics tracking (Nike Philippines Distribution, Adidas Pacific Supply, Puma & New Balance Hub).
- Multi-item Purchase Orders linked to branch restock requests.
- Delivery receiving verification that increments physical branch inventory and logs stock movements.

### 📜 Stock Movement Audit Trail
- Complete immutable history of all inventory modifications (Sales, Deliveries, and Manual Adjustments).
- Tracks exact quantity delta, reference document ID, actor name, and timestamp.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL / Supabase Cloud
- **Security**: JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC), PostgreSQL Row-Level Security (RLS)

---

## Database Architecture

The complete schema is available in [`migrations/001_init_schema.sql`](./migrations/001_init_schema.sql), with the Prisma representation in [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).

The database is normalized into the following entities:

- `roles` — System roles (`owner`, `admin`, `branch_manager`, `cashier`)
- `branch` — Physical store outlet locations
- `users` — Authenticated staff members mapped to roles and branches
- `products` — Footwear models identified by unique SKU codes
- `inventory` — Product quantities and reorder thresholds per branch
- `sales` & `sale_items` — Completed sales register transactions and line items
- `suppliers` — Footwear brand distributors and contact information
- `purchase_orders` & `purchase_order_items` — Replenishment orders placed with suppliers
- `deliveries` & `delivery_item` — Received vendor shipments and line items
- `restock_requests` — Triggered or manually requested replenishment requests
- `stock_movements` — Comprehensive stock audit trail entries
- `audit_logs` — Before-and-after audit history for database updates

---

## Backend Authentication and Database Security

Apply [`migrations/015_security_rbac.sql`](./migrations/015_security_rbac.sql) with a database owner to initialize non-login `stockline_app` and `stockline_auth` group roles and enable Row-Level Security (RLS):

- `stockline_auth` can only read credential and role fields needed for authentication.
- `stockline_app` enforces branch isolation policies and write permissions based on staff roles.
- Users authenticate via `POST /api/auth/login` using `{ "email": "...", "password": "..." }`, returning a signed JWT bearer token.
