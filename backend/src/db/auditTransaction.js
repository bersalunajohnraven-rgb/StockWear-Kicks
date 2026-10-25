const prisma = require('./prisma');
const { getDatabaseContext } = require('./databaseContext');

/**
 * Executes a database operation within a Prisma transaction, setting
 * the PostgreSQL session setting `app.current_user_id` using a parameterized
 * tagged template ($executeRaw) for row-level audit logging.
 *
 * @param {string|null} currentUserId - The authenticated user ID from JWT (claims.sub)
 * @param {function(object): Promise<any>} operation - Transactional operation callback receiving tx client
 * @returns {Promise<any>}
 */
const runInAuditTransaction = async (currentUserId, operation) => {
    const actorId = currentUserId || getDatabaseContext()?.userID || null;

    return await prisma.$transaction(async (tx) => {
        if (actorId) {
            await tx.$executeRaw`SELECT set_config('app.current_user_id', ${actorId}, true)`;
        }

        return await operation(tx);
    }, {
        maxWait: 20000,
        timeout: 30000
    });
};

module.exports = {
    runInAuditTransaction
};
