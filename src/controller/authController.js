const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EmailOtp = require("../models/EmailOtp");
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
const { sendOtpEmail, sendPasswordResetEmail } = require("../utilis/emailutils");
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

const sendOtpHandler = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "An account with this email already exists. Please sign in instead." });
        }

        // Generate a random 4-digit OTP
        const otp = String(Math.floor(1000 + Math.random() * 9000));

        // Step 1: Try sending email FIRST — do NOT touch DB if this fails
        let result;
        try {
            result = await sendOtpEmail(email, otp);
            console.log("[OTP] Email send result:", result);
        } catch (emailErr) {
            console.error("[OTP] Email send failed:", emailErr);
            return res.status(500).json({ success: false, message: "Failed to send OTP email. Please check the email address and try again." });
        }

        // Step 2: Verify SMTP actually accepted the address (catches invalid/rejected emails)
        if (!result?.accepted?.includes(email)) {
            console.warn("[OTP] Email rejected by SMTP:", email, result?.rejected);
            return res.status(400).json({ success: false, message: "Email address could not be reached. Please enter a valid email." });
        }

        // Step 3: Email confirmed — now safe to write OTP to DB
        await EmailOtp.findOneAndUpdate(
            { email: email.toLowerCase() },
            { otp, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`[OTP] Saved to DB. Email: ${email}`);
        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        return next(err);
    }
};

const verifyOtpHandler = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const record = await EmailOtp.findOne({ email: email.toLowerCase() });
        if (!record) {
            return res.status(400).json({ success: false, message: "OTP expired or not found. Please request a new one." });
        }

        if (record.otp !== String(otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
        }

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (err) {
        return next(err);
    }
};

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

        // Clean up OTP record after successful registration
        await EmailOtp.deleteOne({ email: userData.email });

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

        // ── Save refresh token to DB (enables server-side revocation) ─────────
        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: refreshExpiry,
            deviceInfo: req.headers['user-agent'] || 'unknown',
        });
        // Keep a rolling window — max 5 active sessions per user
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: createUserResponse(user),
                accessToken,
                refreshToken,
                expiresIn: {
                    accessToken: process.env.JWT_ACCESS_EXPIRES || '15m',
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
                isExisting: false,
                message: "If an account exists, you will receive a password reset link shortly."
            });
        }

        // if (foundUser.isGoogle) {
        //     return res.status(200).json({
        //         success: true,
        //         message: "If an account exists, you will receive a password reset link shortly."
        //     });
        // }

        // Generate reset token
        const { token, hashedToken, expiresAt } = generateResetToken();
        foundUser.passwordResetToken = hashedToken;
        foundUser.passwordResetExpires = new Date(expiresAt);
        await foundUser.save();

        // Build reset link — /test matches the Vite app's basename
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:5174";
        const resetLink = `${baseUrl}/test/reset-password?token=${token}&email=${encodeURIComponent(foundUser.email)}`;

        try {
            await sendPasswordResetEmail(foundUser.email, resetLink);
            return res.status(200).json({
                success: true,
                isExisting: true,
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
// ── Refresh Token Handler ─────────────────────────────────────────────────────
// POST /api/auth/refresh-token
// Body: { refreshToken }
// → verifies the refresh token, confirms it exists in DB, issues a new accessToken
//   and rotates the refresh token (old removed, new stored)
const refreshTokenHandler = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is required.' });
        }

        // 1. Verify JWT signature + expiry
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret');
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: err.name === 'TokenExpiredError'
                    ? 'Refresh token has expired. Please log in again.'
                    : 'Invalid refresh token.',
            });
        }

        // 2. Find user and confirm this token is still stored in DB
        const user = await User.findById(decoded.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' });
        }

        const storedToken = user.refreshTokens.find(t => t.token === refreshToken);
        if (!storedToken) {
            // Token not in DB — possible reuse attack; wipe all sessions
            user.refreshTokens = [];
            await user.save();
            return res.status(401).json({ success: false, message: 'Refresh token reuse detected. Please log in again.' });
        }

        // 3. Issue new tokens (rotation — invalidate old refresh token)
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Remove the used token, add the new one
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
        const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        user.refreshTokens.push({
            token: newRefreshToken,
            expiresAt: refreshExpiry,
            deviceInfo: req.headers['user-agent'] || 'unknown',
        });
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (err) {
        return next(err);
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
    resetPasswordHandler,
    refreshTokenHandler,
    sendOtpHandler,
    verifyOtpHandler,
};
