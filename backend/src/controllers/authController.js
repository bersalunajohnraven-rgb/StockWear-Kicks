const authService = require('../services/authService');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await authService.authenticateCredentials(normalizedEmail, password);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const accessToken = authService.createAccessToken(user);

        return res.status(200).json({
            accessToken,
            tokenType: 'Bearer',
            expiresIn: authService.ACCESS_TOKEN_LIFETIME_SECONDS,
            user: {
                userID: user.userID,
                email: user.email,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                role_name: user.roleName,
                branchID: user.branchID,
                branchName: user.branchName
            }
        });
    } catch (error) {
        console.error('[AUTH LOGIN ERROR]', {
            message: error?.message,
            name: error?.name,
            code: error?.code,
            stack: error?.stack,
            envCheck: {
                hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
                hasAuthDatabaseUrl: Boolean(process.env.AUTH_DATABASE_URL),
                hasJwtSecret: Boolean(process.env.JWT_SECRET),
                nodeEnv: process.env.NODE_ENV
            }
        });

        return res.status(500).json({
            message: 'Login is unavailable'
        });
    }
};

module.exports = {
    login
};
