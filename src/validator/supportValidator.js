const { body } = require('express-validator');

// ── Contact Support Validation Rules ──────────────────────────────────────────
// Email is NOT validated here — the controller fetches it directly from the DB
// using req.user.id (set by the authenticate middleware) to prevent spoofing.

const contactSupportValidationRules = [
    body('contact')
        .optional({ checkFalsy: true })
        .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
        .withMessage('Invalid contact number format. Please enter a valid phone number.'),

    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required.')
        .isLength({ min: 5 })
        .withMessage('Message must be at least 5 characters long.'),
];

module.exports = { contactSupportValidationRules };
