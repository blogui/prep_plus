const express = require('express');
const { registerValidationRules, loginValidationRules, forgetPasswordValidationRule, resetValidationRule } = require('../validator/authValidator');
const { registerHandler, loginHandler, redirectToGoogle, handleGoogleCallback, forgetPasswordHandler, resetPasswordHandler, sendOtpHandler, verifyOtpHandler, refreshTokenHandler } = require('../controller/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - age
 *         - email
 *         - gender
 *       properties:
 *         _id:
 *           type: string
 *           example: 650a1b2c3d4e5f6a7b8c9d0e
 *         firstName:
 *           type: string
 *           example: John
 *           minLength: 2
 *           maxLength: 50
 *           pattern: ^[a-zA-Z\s]+$
 *           description: Must be between 2 and 50 characters, letters and spaces only
 *         lastName:
 *           type: string
 *           example: Doe
 *           minLength: 2
 *           maxLength: 50
 *           pattern: ^[a-zA-Z\s]+$
 *           description: Must be between 2 and 50 characters, letters and spaces only
 *         middleName:
 *           type: string
 *           example: Michael
 *           maxLength: 50
 *           pattern: ^[a-zA-Z\s]*$
 *           description: Optional, max 50 characters, letters and spaces only
 *         age:
 *           type: integer
 *           minimum: 18
 *           maximum: 120
 *           example: 25
 *           description: Must be between 18 and 120
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           example: male
 *         isPremium:
 *           type: boolean
 *           example: false
 *         photoUrl:
 *           type: string
 *           format: uri
 *           example: https://static.vecteezy.com/system/resources/previews/021/548/095/non_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg
 *         about:
 *           type: string
 *           maxLength: 500
 *           example: Enthusiastic learner
 *           description: Optional, max 500 characters
 *         hobbies:
 *           type: array
 *           maxItems: 20
 *           items:
 *             type: string
 *             minLength: 1
 *           example: ["reading", "coding"]
 *           description: Optional, max 20 non-empty string items
 *         isGoogle:
 *           type: boolean
 *           example: false
 *         googleId:
 *           type: string
 *           example: null
 *         refreshToken:
 *           type: string
 *           example: null
 *         refreshTokenExpiresAt:
 *           type: string
 *           format: date-time
 *           example: null
 *         refreshTokens:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               deviceInfo:
 *                 type: string
 *                 example: unknown
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - age
 *               - email
 *               - password
 *               - gender
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               middleName:
 *                 type: string
 *                 example: Michael
 *               age:
 *                 type: integer
 *                 example: 25
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               about:
 *                 type: string
 *                 example: Enthusiastic learner
 *               hobbies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["reading", "coding"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: 15m
 *                         refreshToken:
 *                           type: string
 *                           example: 7d
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 */
router.post("/register", registerValidationRules, registerHandler);
router.post("/login", loginValidationRules, loginHandler);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/refresh-token", refreshTokenHandler);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth2.0 authentication
 *     tags:
 *       - Auth
 *     description: Redirects the user to Google's authentication page
 *     responses:
 *       302:
 *         description: Redirects to Google login
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to initiate Google OAuth
 */
router.get('/google', redirectToGoogle);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth2.0 callback
 *     tags:
 *       - Auth
 *     description: Processes the response from Google's authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security verification
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Google authentication successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid authorization code
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to authenticate with Google
 */
router.get('/google/callback', handleGoogleCallback);

/**
 * @swagger
 * /api/auth/forget-password:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - Auth
 *     description: Sends a password reset link to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - captchaToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               captchaToken:
 *                 type: string
 *                 description: reCAPTCHA token for verification
 *                 example: 6Lc_1234567890abcdef
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset link sent to your email
 *       400:
 *         description: Validation error or email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email not found
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to send reset email
 */
router.post('/forget-password', forgetPasswordValidationRule, forgetPasswordHandler);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Auth
 *     description: Reset user password using the token received via email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token received in email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email address associated with the reset token
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]
 *                 example: NewSecurePass123!
 *                 description: Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePass123!
 *                 description: Must match the password field
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired reset token
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to reset password
 */
router.post('/reset-password/:token', resetValidationRule, resetPasswordHandler);
module.exports = router;
