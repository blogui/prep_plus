const express = require("express");
const {
    upsertUserTestProgress,
    getUserTestProgress,
    getAllUserProgress,
} = require("../controller/userTestProgressController");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserTestProgress
 *   description: Track user progress per course/test
 */

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Save or update a user's test progress after submission
 *     tags: [UserTestProgress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *               - questionIds
 *               - score
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user
 *               courseId:
 *                 type: string
 *                 description: MongoDB ObjectId of the course/test
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of question IDs served in this attempt
 *               score:
 *                 type: number
 *                 description: Score obtained in this attempt
 *     responses:
 *       200:
 *         description: Progress saved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Test progress saved successfully"
 *               data:
 *                 userId: "64a..."
 *                 courseId: "64b..."
 *                 seenQuestionIds: ["64c...", "64d..."]
 *                 totalAttempts: 2
 *                 highestScore: 15
 *                 lastAttemptedAt: "2026-02-25T20:00:00.000Z"
 *       400:
 *         description: Missing required fields
 */
router.post("/", authenticate, upsertUserTestProgress);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get a user's progress for a specific course
 *     tags: [UserTestProgress]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress fetched (null data if no attempts yet)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User test progress fetched successfully"
 *               data:
 *                 totalAttempts: 1
 *                 highestScore: 10
 *                 seenQuestionIds: ["64c..."]
 *       400:
 *         description: Missing userId or courseId query params
 */
router.get("/", authenticate, getUserTestProgress);

/**
 * @swagger
 * /api/progress/all:
 *   get:
 *     summary: Get all progress records for a user across all courses
 *     tags: [UserTestProgress]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All progress records with course names
 */
router.get("/all", authenticate, getAllUserProgress);



module.exports = router;
