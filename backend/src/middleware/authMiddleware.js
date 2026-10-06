const jwt = require('jsonwebtoken');
const { runWithDatabaseContext } = require('../db/databaseContext');
const { getJwtSecret, supportedRoles } = require('../services/authService');

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const authenticateUser = (req, res, next) => {
    const authorization = req.header('authorization');
    const tokenMatch = typeof authorization === 'string'
        ? authorization.match(/^Bearer\s+([^\s]+)$/i)
        : null;

    if (!tokenMatch) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    let secret;

    try {
        secret = getJwtSecret();
    } catch (error) {
        console.error('Authentication configuration error:', error);

        return res.status(500).json({
            error: 'Authentication is unavailable'
        });
    }

    let claims;

    try {
        claims = jwt.verify(tokenMatch[1], secret, {
            algorithms: ['HS256'],
            audience: 'stockline-api',
            issuer: 'stockline-api'
        });
    } catch {
        return res.status(401).json({
            error: 'Invalid or expired access token'
        });
    }

    const userID = claims && claims.sub;
    const roleName = claims && claims.roleName;
    const branchID = claims && claims.branchID;

    if (typeof userID !== 'string'
        || !uuidPattern.test(userID)
        || typeof roleName !== 'string'
        || !supportedRoles.has(roleName)
        || (branchID !== null && branchID !== undefined
            && (typeof branchID !== 'string' || !uuidPattern.test(branchID)))
        || (['branch_manager', 'cashier', 'inventory'].includes(roleName) && !branchID)) {
        return res.status(401).json({
            error: 'Invalid access token'
        });
    }

    const normalizedBranchID = branchID || null;

    req.user = {
        userID,
        branchID: normalizedBranchID,
        roles: {
            role_name: roleName
        }
    };

    return runWithDatabaseContext(
        { userID, roleName, branchID: normalizedBranchID },
        next
    );
};

module.exports = {
    authenticateUser
};
