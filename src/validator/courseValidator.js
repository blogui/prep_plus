const { body, param } = require("express-validator")

const createCoureseValidationRule = [
   body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
   body('description').notEmpty().withMessage('Description is required').isString().withMessage('Description must be a string'),
   body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Category must be a valid Mongo ID'),
   body('isPaid').optional().isBoolean().withMessage('isPaid must be a boolean'),
   body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
   body('duration').optional().isString().withMessage('Duration must be a string'),
   body('totalMarks').optional().isInt({ gt: 0 }).withMessage('Total marks must be an integer greater than 0'),
   body('totalQuestions').optional().isInt({ gt: 0 }).withMessage('Total questions must be an integer greater than 0'),
   body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Pro']).withMessage("Difficulty must be one of: Beginner, Intermediate, Pro"),
   body('topics').optional().isArray().withMessage('Topics must be an array'),
   body('topics.*').optional().isString().withMessage('Each topic must be a string'),
   body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
   body('thumbnail').optional().isString().withMessage('Thumbnail must be a string'),
   body('author').notEmpty().withMessage('Author is required').isMongoId().withMessage('Author must be a valid Mongo ID'),
]
const getCourseByIdValidationRule = [
   param('id').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID')
]

const updateCourseValidationRule = [
   param('id').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID'),
   body('title').optional().isString().withMessage('Title must be a string'),
   body('description').optional().isString().withMessage('Description must be a string'),
   body('category').optional().isMongoId().withMessage('Category must be a valid Mongo ID'),
   body('isPaid').optional().isBoolean().withMessage('isPaid must be a boolean'),
   body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
   body('duration').optional().isString().withMessage('Duration must be a string'),
   body('totalMarks').optional().isInt({ gt: 0 }).withMessage('Total marks must be an integer greater than 0'),
   body('totalQuestions').optional().isInt({ gt: 0 }).withMessage('Total questions must be an integer greater than 0'),
   body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Pro']).withMessage("Difficulty must be one of: Beginner, Intermediate, Pro"),
   body('topics').optional().isArray().withMessage('Topics must be an array'),
   body('topics.*').optional().isString().withMessage('Each topic must be a string'),
   body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
   body('thumbnail').optional().isString().withMessage('Thumbnail must be a string'),
   body('author').notEmpty().withMessage('Author is required').isMongoId().withMessage('Author must be a valid Mongo ID'),
]
const deleteCourseValidationRule = [
   param('id').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid Course ID')
]
module.exports = { createCoureseValidationRule, getCourseByIdValidationRule, updateCourseValidationRule, deleteCourseValidationRule }