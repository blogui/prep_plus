const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authenticate — private-route middleware
 *
 * Checks (in order):
 *   1. Authorization: Bearer <token> header present
 *   2. JWT signature valid + not expired
 *   3. User still exists in the database
 *
 * On success → attaches req.user = { id, role } and calls next()
 * On failure → returns 401 with a descriptive message
 */
module.exports = async function authenticate(req, res, next) {
    try {
        // ── 1. Extract token ──────────────────────────────────────────────────
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please log in.',
            });
        }

        const token = authHeader.split(' ')[1];

        // ── 2. Verify JWT (signature + expiry) ────────────────────────────────
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (err) {
            const isExpired = err.name === 'TokenExpiredError';
            return res.status(401).json({
                success: false,
                message: isExpired
                    ? 'Session expired. Please log in again.'
                    : 'Invalid token. Please log in again.',
            });
        }

        // ── 3. Confirm user still exists in DB ───────────────────────────────
        // Lean query — only select the fields we need to minimise DB load
        const user = await User.findById(decoded.user.id)
            .select('_id role')
            .lean();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        // ── 4. Attach user to request for downstream controllers ──────────────
        req.user = { id: user._id, role: user.role };

        next();
    } catch (err) {
        // Unexpected errors (e.g. DB down) → propagate to global error handler
        next(err);
    }
};
