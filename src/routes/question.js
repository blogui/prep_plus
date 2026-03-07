const express = require('express');
const {
  getAllQuestionController,
  createQuestionController,
  getQuestionByIdController,
  updateQuestionController,
  deleteQuestionController,
  uploadQuestionImageController,
  uploadQuestionOptionController,
  uploadQuestionExplanationController,
} = require('../controller/questionController');
const {
  createQuestionValidationRules,
  getQuestionValidationRules,
  updateQuestionValidationRules,
  deleteQuestionValidationRules,
  getSingleQuestionValidationRules
} = require('../validator/questionValidator');
const createUpload = require('../config/multer');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get questions for a course (paged)
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to filter questions by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text to search in question text or tags
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, oldest, mostPopular]
 *         description: Sort option
 *     responses:
 *       200:
 *         description: Paginated list of questions
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               page: 1
 *               totalPages: 5
 *               totalResults: 45
 *               data:
 *                 - _id: "6523e1a..."
 *                   questionText: "What is React?"
 *                   difficulty: "easy"
 *       400:
 *         description: Validation failed / missing courseId
 */
router.get('/', authenticate, getSingleQuestionValidationRules, getAllQuestionController);

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               questionImage:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     image:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               explanation:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *                   image:
 *                     type: string
 *               userId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               marks:
 *                 type: number
 *               negativeMarks:
 *                 type: number
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Question created successfully"
 *               data:
 *                 _id: "6523e1a..."
 *                 questionText: "Sample question"
 *       400:
 *         description: Validation failed
 */
router.post('/', createQuestionValidationRules, createQuestionController);
/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID to delete
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Question deleted successfully"
 *       404:
 *         description: Question not found
 */
router.delete('/:id', deleteQuestionValidationRules, deleteQuestionController);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *     responses:
 *       200:
 *         description: Successfully retrieved question
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: "6523e1a..."
 *                 questionText: "What is React?"
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Question not found
 */
router.get('/:id', getQuestionValidationRules, getQuestionByIdController);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update an existing question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             questionText: "Updated question text"
 *             options:
 *               - text: "Option A"
 *                 isCorrect: true
 *               - text: "Option B"
 *                 isCorrect: false
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Question not found
 */
router.put('/:id', updateQuestionValidationRules, updateQuestionController);

/**
 * @swagger
 * /api/questions/upload/question-image:
 *   post:
 *     summary: Upload a question image
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               que-img:
 *                 type: string
 *                 format: binary
 *                 description: The question image file
 *     responses:
 *       200:
 *         description: Question image uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Thumbnail uploaded successfully"
 *               data:
 *                 thumbnail: "https://example.com/uploads/questions/image.png"
 *       400:
 *         description: Image not provided
 */
router.post(
  '/upload/question-image',
  createUpload('questions').single('que-img'),
  uploadQuestionImageController
);

/**
 * @swagger
 * /api/questions/upload/question-option:
 *   post:
 *     summary: Upload an option image
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               opt-img:
 *                 type: string
 *                 format: binary
 *                 description: The option image file
 *     responses:
 *       200:
 *         description: Option image uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Option image uploaded successfully"
 *               data:
 *                 thumbnail: "https://example.com/uploads/options/option.png"
 *       400:
 *         description: Image not provided
 */
router.post(
  '/upload/question-option',
  createUpload('options').single('opt-img'),
  uploadQuestionOptionController
);

/**
 * @swagger
 * /api/questions/upload/question-explanation:
 *   post:
 *     summary: Upload an explanation image
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               exp-img:
 *                 type: string
 *                 format: binary
 *                 description: The explanation image file
 *     responses:
 *       200:
 *         description: Explanation image uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Explanation image uploaded successfully"
 *               data:
 *                 thumbnail: "https://example.com/uploads/explanations/explain.png"
 *       400:
 *         description: Image not provided
 */
router.post(
  '/upload/question-explanation',
  createUpload('explanations').single('exp-img'),
  uploadQuestionExplanationController
);

module.exports = router;
