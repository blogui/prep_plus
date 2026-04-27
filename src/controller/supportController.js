const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendSupportEmail } = require('../utilis/emailutils');

/**
 * contactSupportHandler
 * POST /api/support/contact
 *
 * Security:
 *  - Route is protected by authenticate middleware (req.user.id is guaranteed)
 *  - The user's email is fetched from DB using req.user.id — never from req.body —
 *    preventing any email spoofing via crafted POST bodies.
 */
const contactSupportHandler = async (req, res, next) => {
    try {
        // ── 1. Validate incoming fields ────────────────────────────────────────
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { contact, message } = req.body;

        // ── 2. Fetch authoritative email from DB (anti-spoofing) ───────────────
        const user = await User.findById(req.user.id).select('email').lean();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.',
            });
        }
        const userEmail = user.email;

        // ── 3. Send support email ──────────────────────────────────────────────
        try {
            await sendSupportEmail(userEmail, contact || null, message);
        } catch (emailErr) {
            console.error('[Support] Email send failed:', {
                userId: req.user.id,
                email: userEmail,
                error: emailErr.message,
                timestamp: new Date().toISOString(),
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to send your message. Please try again later.',
            });
        }

        // ── 4. Log successful request ──────────────────────────────────────────
        console.log('[Support] Request received:', {
            userId: req.user.id,
            email: userEmail,
            hasContact: !!contact,
            timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
            success: true,
            message: "Your message has been sent. We'll get back to you shortly.",
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = { contactSupportHandler };
