-- Apply with a trusted database owner after the schema migrations.
DO $$
BEGIN
    CREATE ROLE stockline_app
        NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

ALTER ROLE stockline_app
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;

DO $$
BEGIN
    CREATE ROLE stockline_auth
        NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

ALTER ROLE stockline_auth
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM stockline_app, stockline_auth;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM stockline_auth;
GRANT USAGE ON SCHEMA public TO stockline_app, stockline_auth;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO stockline_app;
REVOKE SELECT ON public.users FROM stockline_app;
REVOKE SELECT (password_hash) ON public.users FROM stockline_app;
GRANT SELECT (
    "userID", "firstName", "middleName", "lastName", email, "roleID", "branchID", created_at
) ON public.users TO stockline_app;

GRANT SELECT (
    "userID", email, password_hash, "roleID", "branchID"
) ON public.users TO stockline_auth;
GRANT SELECT ("roleID", role_name) ON public.roles TO stockline_auth;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT INSERT, UPDATE, DELETE ON TABLES TO stockline_app;

CREATE POLICY stockline_auth_read_users ON public.users
    FOR SELECT TO stockline_auth USING (true);
CREATE POLICY stockline_auth_read_roles ON public.roles
    FOR SELECT TO stockline_auth USING (true);

ALTER TABLE public.branch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY stockline_roles_read ON public.roles
    FOR SELECT TO stockline_app
    USING (current_setting('app.user_id', true) IS NOT NULL);
CREATE POLICY stockline_roles_admin_write ON public.roles
    FOR ALL TO stockline_app
    USING (current_setting('app.role', true) IN ('owner', 'admin'))
    WITH CHECK (current_setting('app.role', true) IN ('owner', 'admin'));

CREATE POLICY stockline_users_read_scope ON public.users
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR (
            current_setting('app.role', true) = 'branch_manager'
            AND "branchID"::text = current_setting('app.branch_id', true)
        )
        OR (
            current_setting('app.role', true) IN ('cashier', 'inventory')
            AND "userID"::text = current_setting('app.user_id', true)
        )
    );
CREATE POLICY stockline_users_admin_write ON public.users
    FOR ALL TO stockline_app
    USING (current_setting('app.role', true) IN ('owner', 'admin'))
    WITH CHECK (current_setting('app.role', true) IN ('owner', 'admin'));

CREATE POLICY stockline_branch_read_scope ON public.branch
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR "branchID"::text = current_setting('app.branch_id', true)
    );
CREATE POLICY stockline_branch_write_scope ON public.branch
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR (
            current_setting('app.role', true) = 'branch_manager'
            AND "branchID"::text = current_setting('app.branch_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR (
            current_setting('app.role', true) = 'branch_manager'
            AND "branchID"::text = current_setting('app.branch_id', true)
        )
    );

CREATE POLICY stockline_products_read ON public.products
    FOR SELECT TO stockline_app
    USING (current_setting('app.user_id', true) IS NOT NULL);
CREATE POLICY stockline_products_write ON public.products
    FOR ALL TO stockline_app
    USING (current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory'))
    WITH CHECK (current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory'));

CREATE POLICY stockline_suppliers_read ON public.suppliers
    FOR SELECT TO stockline_app
    USING (current_setting('app.user_id', true) IS NOT NULL);
CREATE POLICY stockline_suppliers_write ON public.suppliers
    FOR ALL TO stockline_app
    USING (current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager'))
    WITH CHECK (current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager'));

CREATE POLICY stockline_inventory_read_scope ON public.inventory
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR "branchID"::text = current_setting('app.branch_id', true)
    );
CREATE POLICY stockline_inventory_write_scope ON public.inventory
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    );

CREATE POLICY stockline_restock_read_scope ON public.restock_requests
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR "branchID"::text = current_setting('app.branch_id', true)
    );
CREATE POLICY stockline_restock_write_scope ON public.restock_requests
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    );

CREATE POLICY stockline_purchase_orders_read_scope ON public.purchase_orders
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR "branchID"::text = current_setting('app.branch_id', true)
    );
CREATE POLICY stockline_purchase_orders_write_scope ON public.purchase_orders
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    );

CREATE POLICY stockline_deliveries_read_scope ON public.deliveries
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR "branchID"::text = current_setting('app.branch_id', true)
    );
CREATE POLICY stockline_deliveries_write_scope ON public.deliveries
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    );

CREATE POLICY stockline_purchase_items_scope ON public.purchase_order_items
    FOR ALL TO stockline_app
    USING (
        EXISTS (
            SELECT 1
            FROM public.purchase_orders AS po
            WHERE po."orderID" = public.purchase_order_items."orderID"
              AND (
                  current_setting('app.role', true) IN ('owner', 'admin')
                  OR (
                      current_setting('app.role', true) IN ('branch_manager', 'inventory')
                      AND po."branchID"::text = current_setting('app.branch_id', true)
                  )
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.purchase_orders AS po
            WHERE po."orderID" = public.purchase_order_items."orderID"
              AND (
                  current_setting('app.role', true) IN ('owner', 'admin')
                  OR (
                      current_setting('app.role', true) IN ('branch_manager', 'inventory')
                      AND po."branchID"::text = current_setting('app.branch_id', true)
                  )
              )
        )
    );

CREATE POLICY stockline_delivery_items_scope ON public.delivery_items
    FOR ALL TO stockline_app
    USING (
        EXISTS (
            SELECT 1
            FROM public.deliveries AS d
            WHERE d."deliveryID" = public.delivery_items."deliveryID"
              AND (
                  current_setting('app.role', true) IN ('owner', 'admin')
                  OR (
                      current_setting('app.role', true) IN ('branch_manager', 'inventory')
                      AND d."branchID"::text = current_setting('app.branch_id', true)
                  )
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.deliveries AS d
            WHERE d."deliveryID" = public.delivery_items."deliveryID"
              AND (
                  current_setting('app.role', true) IN ('owner', 'admin')
                  OR (
                      current_setting('app.role', true) IN ('branch_manager', 'inventory')
                      AND d."branchID"::text = current_setting('app.branch_id', true)
                  )
              )
        )
    );

CREATE POLICY stockline_sales_scope ON public.sales
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR (
            current_setting('app.role', true) IN ('branch_manager', 'cashier')
            AND "branchID"::text = current_setting('app.branch_id', true)
            AND (
                current_setting('app.role', true) <> 'cashier'
                OR "cashierID"::text = current_setting('app.user_id', true)
            )
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR (
            current_setting('app.role', true) IN ('branch_manager', 'cashier')
            AND "branchID"::text = current_setting('app.branch_id', true)
            AND (
                current_setting('app.role', true) <> 'cashier'
                OR "cashierID"::text = current_setting('app.user_id', true)
            )
        )
    );

CREATE POLICY stockline_sale_items_scope ON public.sale_items
    FOR ALL TO stockline_app
    USING (
        EXISTS (
            SELECT 1
            FROM public.sales AS s
            WHERE s."saleID" = public.sale_items."saleID"
              AND (
                  current_setting('app.role', true) IN ('owner', 'admin')
                  OR (
                      current_setting('app.role', true) IN ('branch_manager', 'cashier')
                      AND s."branchID"::text = current_setting('app.branch_id', true)
                      AND (
                          current_setting('app.role', true) <> 'cashier'
                          OR s."cashierID"::text = current_setting('app.user_id', true)
                      )
                  )
              )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.sales AS s
            WHERE s."saleID" = public.sale_items."saleID"
              AND (
                  current_setting('app.role', true) IN ('owner', 'admin')
                  OR (
                      current_setting('app.role', true) IN ('branch_manager', 'cashier')
                      AND s."branchID"::text = current_setting('app.branch_id', true)
                      AND (
                          current_setting('app.role', true) <> 'cashier'
                          OR s."cashierID"::text = current_setting('app.user_id', true)
                      )
                  )
              )
        )
    );

CREATE POLICY stockline_stock_movements_read_scope ON public.stock_movements
    FOR SELECT TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin')
        OR "branchID"::text = current_setting('app.branch_id', true)
    );
CREATE POLICY stockline_stock_movements_write_scope ON public.stock_movements
    FOR ALL TO stockline_app
    USING (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    )
    WITH CHECK (
        current_setting('app.role', true) IN ('owner', 'admin', 'branch_manager', 'inventory')
        AND (
            current_setting('app.role', true) IN ('owner', 'admin')
            OR "branchID"::text = current_setting('app.branch_id', true)
        )
    );
