const express = require('express');
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/authenticate');
const { contactSupportValidationRules } = require('../validator/supportValidator');
const { contactSupportHandler } = require('../controller/supportController');

const router = express.Router();

// ── Rate limiter: max 5 support submissions per IP per 15 minutes ─────────────
const supportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many support requests from this IP. Please try again in 15 minutes.',
    },
});

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Contact support endpoints
 */

/**
 * @swagger
 * /api/support/contact:
 *   post:
 *     summary: Send a support request email
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               contact:
 *                 type: string
 *                 description: Optional contact phone number
 *                 example: "+91 98765 43210"
 *               message:
 *                 type: string
 *                 description: Support message (min 5 characters)
 *                 example: "I am unable to access the premium test."
 *     responses:
 *       200:
 *         description: Support email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Your message has been sent. We'll get back to you shortly."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors: [{ msg: "Message is required.", path: "message" }]
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Too many support requests from this IP. Please try again in 15 minutes."
 *       500:
 *         description: Email send failure
 */
router.post(
    '/contact',
    authenticate,
    supportLimiter,
    contactSupportValidationRules,
    contactSupportHandler
);

module.exports = router;
