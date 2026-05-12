const geoip = require('geoip-lite');
const UserAccessLog = require('../models/UserAccessLog');
const UAParser = require('ua-parser-js');
const crypto = require('crypto');

/**
 * logPublicAccess — public-route middleware
 * 
 * Logs access from incognito/public users without authentication
 * Generates a session-based incognitoId for tracking sessions
 */
module.exports = async function logPublicAccess(req, res, next) {
    try {
        // Skip if already authenticated
        if (req.user) {
            return next();
        }

        // Get or create incognito session ID from header
        let incognitoId = req.headers['x-session-id'];
        if (!incognitoId) {
            incognitoId = crypto.randomBytes(16).toString('hex');
        }

        // Extract IP address
        const forwardedFor = req.headers['x-forwarded-for'];
        const rawIp = forwardedFor
            ? forwardedFor.split(',')[0].trim()
            : req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        const ip = rawIp.replace('::ffff:', '');
        
        // Lookup country
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : 'Unknown';
        
        // Parse user agent
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const parser = new UAParser(userAgent);
        const { browser, os, device } = parser.getResult();

        // Log public access
        UserAccessLog.create({
            userId: null,
            userName: 'Incognito User',
            userEmail: null,
            userMobile: null,
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
            isIncognito: true,
            incognitoId,
        }).catch((err) => {
            console.error('Failed to log public access:', err);
        });

        // Attach incognito session ID to response header
        res.setHeader('X-Session-Id', incognitoId);
        
        next();
    } catch (err) {
        // Don't block public access on logging failure
        console.error('Error in logPublicAccess middleware:', err);
        next();
    }
};
