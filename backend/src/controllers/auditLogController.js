const auditLogService = require('../services/auditLogService');

const getAuditLogs = async (req, res) => {
    try {
        const {
            tableName,
            table_name,
            recordId,
            record_id,
            action,
            changedBy,
            changed_by,
            limit,
            offset
        } = req.query;

        const result = await auditLogService.getAuditLogs({
            tableName: tableName || table_name,
            recordId: recordId || record_id,
            action,
            changedBy: changedBy || changed_by,
            limit,
            offset
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to retrieve audit logs:', error);
        res.status(500).json({
            message: 'Failed to retrieve audit logs',
            error: error.message
        });
    }
};

module.exports = {
    getAuditLogs
};
