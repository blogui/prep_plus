const jwt = require('jsonwebtoken');
const User = require('../models/User');
const geoip = require('geoip-lite');
const UserAccessLog = require('../models/UserAccessLog');
const UAParser = require('ua-parser-js');

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
            .select('_id role name email mobile')
            .lean();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        // ── 4. Attach user to request for downstream controllers ──────────────
        req.user = { id: user._id, role: user.role, name: user.name, email: user.email, mobile: user.mobile };

        // ── 5. Log user access ───────────────────────────────────────────────
        const forwardedFor = req.headers['x-forwarded-for'];
        const rawIp = forwardedFor
            ? forwardedFor.split(',')[0].trim()
            : req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        const ip = rawIp.replace('::ffff:', '');
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const parser = new UAParser(userAgent);
        const { browser, os, device } = parser.getResult();

        UserAccessLog.create({
          userId: req.user.id,
          userName: req.user.name || 'Unknown',
          userEmail: req.user.email || 'Unknown',
          userMobile: req.user.mobile || null,
          ip,
          country,
          page: req.originalUrl,
          userAgent,
          browserName: browser.name || 'Unknown',
          browserVersion: browser.version || '',
          osName: os.name || 'Unknown',
          osVersion: os.version || '',
          deviceType: device.type || 'desktop',
          deviceModel: device.model || '',
          isIncognito: false,
        }).catch((err) => {
          console.error('Failed to save access log:', err);
        });

        next();
    } catch (err) {
        // Unexpected errors (e.g. DB down) → propagate to global error handler
        next(err);
    }
};
