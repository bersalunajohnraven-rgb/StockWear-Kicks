const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60;
const PASSWORD_HASH_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_BYTES = 72;
const supportedRoles = new Set(['owner', 'admin', 'branch_manager', 'cashier', 'inventory']);

let authPrisma;

const getAuthPrisma = () => {
    const databaseUrl = process.env.AUTH_DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('AUTH_DATABASE_URL is required for login');
    }

    if (!authPrisma) {
        authPrisma = new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl
                }
            }
        });
    }

    return authPrisma;
};

const verifyAuthDatabaseRole = async () => {
    const client = getAuthPrisma();
    const [role] = await client.$queryRaw`
        SELECT
            current_user AS role_name,
            r.rolsuper AS is_superuser,
            r.rolbypassrls AS bypasses_rls,
            pg_has_role(current_user, 'stockline_auth', 'USAGE') AS has_auth_privileges,
            has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_schema,
            has_table_privilege(current_user, 'public.users', 'SELECT') AS can_read_all_user_columns,
            has_table_privilege(current_user, 'public.roles', 'SELECT') AS can_read_all_role_columns,
            has_column_privilege(current_user, 'public.users', 'userID', 'SELECT') AS can_read_user_id,
            has_column_privilege(current_user, 'public.users', 'password_hash', 'SELECT') AS can_read_password_hash,
            has_column_privilege(current_user, 'public.users', 'email', 'SELECT') AS can_read_login_email,
            has_column_privilege(current_user, 'public.users', 'roleID', 'SELECT') AS can_read_user_role,
            has_column_privilege(current_user, 'public.users', 'branchID', 'SELECT') AS can_read_user_branch,
            has_column_privilege(current_user, 'public.roles', 'roleID', 'SELECT') AS can_read_role_id,
            has_column_privilege(current_user, 'public.roles', 'role_name', 'SELECT') AS can_read_role_name,
            EXISTS (
                SELECT 1
                FROM pg_class AS c
                JOIN pg_namespace AS n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public'
                  AND c.relname IN ('users', 'roles')
                  AND c.relowner = current_user::regrole
            ) AS owns_auth_table
        FROM pg_roles AS r
        WHERE r.rolname = current_user
    `;

    if (!role
        || role.is_superuser
        || role.bypasses_rls
        || !role.has_auth_privileges
        || role.can_create_in_schema
        || role.can_read_all_user_columns
        || role.can_read_all_role_columns
        || !role.can_read_user_id
        || !role.can_read_password_hash
        || !role.can_read_login_email
        || !role.can_read_user_role
        || !role.can_read_user_branch
        || !role.can_read_role_id
        || !role.can_read_role_name
        || role.owns_auth_table) {
        throw new Error('AUTH_DATABASE_URL must use a non-owner login limited to stockline_auth column privileges');
    }
};

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 bytes');
    }

    return secret;
};

const isValidPassword = (password) => {
    return typeof password === 'string'
        && password.length >= MIN_PASSWORD_LENGTH
        && Buffer.byteLength(password, 'utf8') <= MAX_PASSWORD_BYTES;
};

const hashPassword = async (password) => {
    if (!isValidPassword(password)) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters and no more than ${MAX_PASSWORD_BYTES} UTF-8 bytes`);
    }

    return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
};

const authenticateCredentials = async (email, password) => {
    if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
        return null;
    }

    const user = await getAuthPrisma().users.findUnique({
        where: { email },
        select: {
            userID: true,
            email: true,
            password_hash: true,
            branchID: true,
            roles: {
                select: {
                    role_name: true
                }
            }
        }
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return null;
    }

    const roleName = user.roles.role_name;

    if (!supportedRoles.has(roleName)) {
        return null;
    }

    if (['branch_manager', 'cashier', 'inventory'].includes(roleName) && !user.branchID) {
        return null;
    }

    return {
        userID: user.userID,
        branchID: user.branchID,
        roleName
    };
};

const createAccessToken = (user) => {
    return jwt.sign(
        {
            roleName: user.roleName,
            branchID: user.branchID
        },
        getJwtSecret(),
        {
            algorithm: 'HS256',
            audience: 'stockline-api',
            expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
            issuer: 'stockline-api',
            subject: user.userID
        }
    );
};

module.exports = {
    ACCESS_TOKEN_LIFETIME_SECONDS,
    authenticateCredentials,
    createAccessToken,
    getJwtSecret,
    hashPassword,
    isValidPassword,
    supportedRoles,
    verifyAuthDatabaseRole
};
