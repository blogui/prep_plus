const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
    prepareUserData,
    validateUserData,
    hashPassword,
    createUserResponse,
    validateLoginCredentials,
    comparePassword,
    generateTokens,
    generateResetToken,
} = require("../utilis/authUtilis");
const { sendResetPasswordEmail } = require("../utilis/emailutils");
const client = require('../config/OAuth2');

const redirectToGoogle = (req, res) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email']
    });
    res.redirect(url);
}

const handleGoogleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId, email_verified, given_name, family_name } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: name,
                email: email,
                password: "", // No password for Google users
                photoUrl: picture,
                isGoogle: true,
                googleId: googleId,
            });
            await user.save();
        }

        const { accessToken, refreshToken } = generateTokens(user);



        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

        // Encode user data
        const userData = JSON.stringify(createUserResponse(user));

        res.redirect(`${frontendUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(userData)}`);

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, message: "Failed to authenticate with Google" });
    }
}

const registerHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation failed");
            error.status = 400;
            error.errors = errors.array();
            return next(error);
        }

        const userData = prepareUserData(req.body);

        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await hashPassword(userData.password);
        const user = new User({
            ...userData,
            password: hashedPassword,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: createUserResponse(user),
        });
    } catch (err) {
        return next(err);
    }
};

const loginHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation failed");
            error.status = 400;
            error.errors = errors.array();
            return next(error);
        }
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (user.isGoogle) {
            return res.status(400).json({ success: false, message: "Please login with Google" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        // user.refreshToken = refreshToken; // Optional: save refresh token to DB
        // await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: createUserResponse(user),
                accessToken,
                refreshToken,
                expiresIn: {
                    accessToken: '15m',
                    refreshToken: '7d'
                }
            },
        });
    } catch (err) {
        return next(err);
    }
};

const forgetPasswordHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation failed");
            error.status = 400;
            error.errors = errors.array();
            return next(error);
        }

        const { email } = req.body;
        const foundUser = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent user enumeration
        if (!foundUser) {
            return res.status(200).json({
                success: true,
                message: "If an account exists, you will receive a password reset link shortly."
            });
        }

        if (foundUser.isGoogle) {
            return res.status(200).json({
                success: true,
                message: "If an account exists, you will receive a password reset link shortly."
            });
        }

        // Generate reset token
        const { token, hashedToken, expiresAt } = generateResetToken();
        foundUser.passwordResetToken = hashedToken;
        foundUser.passwordResetExpires = new Date(expiresAt);
        await foundUser.save();

        // Build reset link — /test matches the Vite app's basename
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:5174";
        const resetLink = `${baseUrl}/test/reset-password?token=${token}&email=${encodeURIComponent(foundUser.email)}`;

        try {
            await sendResetPasswordEmail(foundUser.email, resetLink);
            return res.status(200).json({
                success: true,
                message: "If an account exists, you will receive a password reset link shortly."
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // Roll back token to keep DB clean
            foundUser.passwordResetToken = undefined;
            foundUser.passwordResetExpires = undefined;
            await foundUser.save();
            return res.status(500).json({
                success: false,
                message: "Error sending reset email. Please try again later."
            });
        }

    } catch (error) {
        return next(error);
    }
};
const resetPasswordHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation failed");
            error.status = 400;
            error.errors = errors.array();
            return next(error);
        }

        const { email, newPassword } = req.body;
        const token = req.params.token;

        const foundUser = await User.findOne({ email: email.toLowerCase() });
        if (!foundUser || !foundUser.passwordResetToken) {
            return res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
        }

        // Hash token sent by user and compare
        const crypto = require("crypto");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        if (hashedToken !== foundUser.passwordResetToken || foundUser.passwordResetExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
        }

        foundUser.password = await hashPassword(newPassword);

        // Clear reset token fields
        foundUser.passwordResetToken = undefined;
        foundUser.passwordResetExpires = undefined;
        foundUser.refreshTokens = [];
        foundUser.refreshToken = null;

        await foundUser.save();

        return res.status(200).json({ success: true, message: "Password reset successful. Please login with your new password." });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerHandler,
    loginHandler,
    redirectToGoogle,
    handleGoogleCallback,
    forgetPasswordHandler,
    resetPasswordHandler
};
