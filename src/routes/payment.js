const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');

/**
 * PATCH /api/payment/activate-premium
 * Protected — requires a valid JWT (Bearer token).
 * Simulates a successful payment by setting isPremium = true on the user.
 */
router.patch('/activate-premium', authenticate, async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isPremium: true },
            { new: true, select: '-password -passwordResetToken -passwordResetExpires -refreshTokens -refreshToken' }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Premium activated successfully! Enjoy unlimited access.',
            data: { user },
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
