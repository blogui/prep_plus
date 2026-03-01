const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prepareUserData = (data) => {
    return {
        name: data.name,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
        role: data.role || 'user',
        isGoogle: false,
        isGoogleAuthenticated: false,
        isPremium: false
    };
};

const validateUserData = (data) => {
    // Basic validation is handled by express-validator in authValidator.js
    // This could be for additional business logic checks if needed
    return null;
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const createUserResponse = (user) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        photoUrl: user.photoUrl,
        isPremium: user.isPremium ?? false,
        createdAt: user.createdAt
    };
};

const generateTokens = (user) => {
    const payload = {
        user: {
            id: user._id,
            role: user.role
        }
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refreshSecret', { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

const generateResetToken = () => {
    // Generate a random token
    return require('crypto').randomBytes(32).toString('hex');
};

const validateLoginCredentials = (email, password) => {
    // Handled by express-validator
    if (!email || !password) return false;
    return true;
};

module.exports = {
    prepareUserData,
    validateUserData,
    hashPassword,
    comparePassword,
    createUserResponse,
    generateTokens,
    generateResetToken,
    validateLoginCredentials
};
