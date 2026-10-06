const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const userRole = req.user.roles.role_name;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        next();
    };
};

module.exports = {
    authorizeRoles
};