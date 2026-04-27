
const cache = require("../middleware/cacheMiddleware");
const authenticate = require("../middleware/authenticate");
const { createCourseController, getCourseByIdController, updateCourseController, deleteCourseController, getAllCourseController, uploadThumbnailController } = require("../controller/courseController");
const { createCoureseValidationRule, getCourseByIdValidationRule, updateCourseValidationRule, deleteCourseValidationRule } = require("../validator/courseValidator");

const express = require('express');
const createUpload = require("../config/multer");
const router = express.Router();
const upload = createUpload("courses");

/**
 * @openapi
 * components:
 *   schemas:
 *     CourseInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           description: MongoDB ObjectId of category
 *         isPaid:
 *           type: boolean
 *         price:
 *           type: number
 *         duration:
 *           type: string
 *         totalMarks:
 *           type: integer
 *         totalQuestions:
 *           type: integer
 *         isPublished:
 *           type: boolean
 *         thumbnail:
 *           type: string
 *         author:
 *           type: string
 *           description: MongoDB ObjectId of author
 *       required:
 *         - title
 *         - description
 *         - category
 *         - author
 *
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             thumbnail:
 *               type: string
 */

/*
	GET /api/courses
*/
/**
 * @openapi
 * /api/courses:
 *   get:
 *     summary: Retrieve a list of courses with optional pagination, filtering and search
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search against title/description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ObjectId
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: A paginated list of courses
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
 *                   example: "All courses fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       isPublished:
 *                         type: boolean
 *                       isPaid:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Bad request (invalid query params)
 */
router.get('/', cache('courses'), getAllCourseController);

/**
 * @openapi
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags:
 *       - Courses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *           examples:
 *             minimal:
 *               summary: Minimal required fields
 *               value:
 *                 title: "Basic Logic Course"
 *                 description: "An introductory logic course for juniors"
 *                 category: "64a7b2f9e4b0f2a5d8c3f1a2"
 *                 author: "64a7b2f9e4b0f2a5d8c3f1b3"
 *                 isPaid: false
 *             full:
 *               summary: Full payload with optional fields
 *               value:
 *                 title: "Advanced Logic Course"
 *                 description: "A deeper dive into logical reasoning and puzzles"
 *                 category: "64a7b2f9e4b0f2a5d8c3f1a2"
 *                 author: "64a7b2f9e4b0f2a5d8c3f1b3"
 *                 isPaid: true
 *                 price: 19.99
 *                 duration: "4 weeks"
 *                 totalMarks: 100
 *                 totalQuestions: 50
 *                 isPublished: false
 *                 thumbnail: "https://example.com/uploads/courses/sample.jpg"
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: "Course created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
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
 *                   example: "Validation failed"
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
router.post('/', createCoureseValidationRule, createCourseController);

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     summary: Retrieve a course by its id
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course id
 *     responses:
 *       200:
 *         description: Course retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourseByIdValidationRule, getCourseByIdController);

/**
 * @openapi
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course by its id
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/CourseInput'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Course not found
 */
router.put('/:id', updateCourseValidationRule, updateCourseController);

/**
 * @openapi
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course by its id
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course id
 *     responses:
 *       200:
 *         description: Course deleted successfully
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
 *       404:
 *         description: Course not found
 */
router.delete('/:id', deleteCourseValidationRule, deleteCourseController);

/**
 * @openapi
 * /api/courses/upload/thumbnail:
 *   post:
 *     summary: Upload course thumbnail image
 *     tags:
 *       - Courses
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thumbnail uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request / missing file
 */
router.post('/upload/thumbnail', upload.single('thumbnail'), uploadThumbnailController);
module.exports = router;