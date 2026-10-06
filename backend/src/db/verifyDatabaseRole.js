const prisma = require('./prisma');

const EXPECTED_TABLE_COUNT = 14;

const verifyDatabaseRole = async () => {
    const [role] = await prisma.$queryRaw`
        SELECT
            current_user AS role_name,
            r.rolsuper AS is_superuser,
            r.rolbypassrls AS bypasses_rls,
            pg_has_role(current_user, 'stockline_app', 'USAGE') AS has_app_privileges,
            has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_schema
        FROM pg_roles AS r
        WHERE r.rolname = current_user
    `;

    if (!role
        || role.is_superuser
        || role.bypasses_rls
        || !role.has_app_privileges
        || role.can_create_in_schema) {
        throw new Error('DATABASE_URL must use a non-owner runtime login that inherits stockline_app privileges and does not bypass RLS');
    }

    const [tableStatus] = await prisma.$queryRaw`
        SELECT
            COUNT(*)::int AS table_count,
            COUNT(*) FILTER (WHERE c.relrowsecurity)::int AS secured_table_count,
            BOOL_OR(c.relowner = current_user::regrole) AS owns_table
        FROM pg_class AS c
        JOIN pg_namespace AS n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname IN (
              'branch', 'roles', 'users', 'suppliers', 'products', 'inventory',
              'restock_requests', 'purchase_orders', 'purchase_order_items',
              'deliveries', 'delivery_items', 'sales', 'sale_items', 'stock_movements'
          )
          AND c.relkind IN ('r', 'p')
    `;

    if (!tableStatus
        || tableStatus.table_count !== EXPECTED_TABLE_COUNT
        || tableStatus.secured_table_count !== EXPECTED_TABLE_COUNT
        || tableStatus.owns_table) {
        throw new Error('Database schema is missing required row-level security policies or DATABASE_URL owns protected tables');
    }
};

module.exports = {
    verifyDatabaseRole
};
