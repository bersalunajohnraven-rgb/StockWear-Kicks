const authService = require('../services/authService');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    try {
        const user = await authService.authenticateCredentials(email, password);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const accessToken = authService.createAccessToken(user);

        return res.status(200).json({
            accessToken,
            tokenType: 'Bearer',
            expiresIn: authService.ACCESS_TOKEN_LIFETIME_SECONDS
        });
    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Login is unavailable'
        });
    }
};

module.exports = {
    login
};
