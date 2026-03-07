const express = require('express');
const { getAllCategoriesHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } = require('../controller/categoryController');
const { deleteCategoryValidationRule, updateCategoryValidationRule, createCategoryValidationRule } = require('../validator/categoryValidator');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the category
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           description: The name of the category
 *           example: Mathematics
 *         slug:
 *           type: string
 *           description: URL-friendly version of the name
 *           example: mathematics
 *         description:
 *           type: string
 *           description: Detailed description of the category
 *           example: Contains all mathematics related questions
 *         isActive:
 *           type: boolean
 *           description: Whether the category is active or not
 *           example: true
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         name: Mathematics
 *         slug: mathematics
 *         description: Contains all mathematics related questions
 *         isActive: true
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved all categories
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
 *                   example: All categories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 total:
 *                   type: number
 *                   example: 1
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getAllCategoriesHandler);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: Mathematics
 *               description:
 *                 type: string
 *                 minLength: 5
 *                 example: Math related questions
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: Category created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', createCategoryValidationRule, createCategoryHandler);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: Updated Mathematics
 *               description:
 *                 type: string
 *                 minLength: 5
 *                 example: Updated math description
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: Category updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateCategoryValidationRule, updateCategoryHandler);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the category to delete
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *                   example: Category deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteCategoryValidationRule, deleteCategoryHandler);
module.exports = router;