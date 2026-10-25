const prisma = require('../db/prisma');

/**
 * Retrieves audit log entries with optional filtering and pagination.
 *
 * @param {Object} filters
 * @param {string} [filters.tableName]
 * @param {string} [filters.recordId]
 * @param {string} [filters.action]
 * @param {string} [filters.changedBy]
 * @param {number|string} [filters.limit=100]
 * @param {number|string} [filters.offset=0]
 * @returns {Promise<{items: Array, total: number}>}
 */
const getAuditLogs = async (filters = {}) => {
    const {
        tableName,
        recordId,
        action,
        changedBy,
        limit = 100,
        offset = 0
    } = filters;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    // If audit_log is available as a Prisma model delegate, use findMany
    if (prisma.audit_log && typeof prisma.audit_log.findMany === 'function') {
        const where = {};
        if (tableName) where.table_name = tableName;
        if (recordId) where.record_id = recordId;
        if (action) where.action = action;
        if (changedBy) where.changed_by = changedBy;

        const [items, total] = await Promise.all([
            prisma.audit_log.findMany({
                where,
                orderBy: {
                    changed_at: 'desc'
                },
                take: parsedLimit,
                skip: parsedOffset
            }),
            prisma.audit_log.count({ where })
        ]);

        return { items, total };
    }

    // Direct SQL fallback
    const items = await prisma.$queryRaw`
        SELECT
            audit_id,
            table_name,
            record_id,
            action,
            changed_fields,
            old_data,
            new_data,
            changed_by,
            changed_at
        FROM public.audit_log
        WHERE (${tableName || null}::text IS NULL OR table_name = ${tableName})
          AND (${recordId || null}::text IS NULL OR record_id = ${recordId})
          AND (${action || null}::text IS NULL OR action = ${action})
          AND (${changedBy || null}::text IS NULL OR changed_by = ${changedBy})
        ORDER BY changed_at DESC
        LIMIT ${parsedLimit}
        OFFSET ${parsedOffset}
    `;

    return { items, total: items.length };
};

module.exports = {
    getAuditLogs
};
