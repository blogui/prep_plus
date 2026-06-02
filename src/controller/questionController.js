const { validationResult } = require("express-validator");
const { prepareQuestionData, validateQuestionData, prepareUpdateQuestionData } = require("../utilis/questionUtilis");
const Question = require("../models/Question");
const { getQuestionsByCourseIdService } = require("../services/questionServices");

const getAllQuestionController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = errors.array();
      return next(error);
    }
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }
    const result = await getQuestionsByCourseIdService(req.query);
     console.log("**************",result.data.length)
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};
const getQuestionByIdController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = errors.array();
      return next(error);
    }
    const questionId = req.params.id;
    const question = await Question.findById(questionId).populate({
      path: 'courseId',
      select: 'title category',
      populate: { path: 'category', select: 'name' }
    }).populate('userId', "firstName email");
    if (!question) {
      const error = new Error("Question not found");
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: question })
  } catch (error) {
    return next(error);
  }
};
const createQuestionController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = errors.array();
      return next(error);
    }
    const questionData = prepareQuestionData(req.body);
    const additionalErrors = validateQuestionData(questionData);
    if (additionalErrors) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = additionalErrors;
      return next(error);
    }
    const newQuestion = new Question(questionData);
    await newQuestion.save();
    res.status(201).json({ success: true, message: "Question created successfully", data: newQuestion });

  } catch (error) {
    return next(error);
  }
};
const updateQuestionController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = errors.array();
      return next(error);
    }
    const questionId = req.params.id;
    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    const updateData = prepareUpdateQuestionData(req.body);
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    return next(error);
  }
};
const deleteQuestionController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = errors.array();
      return next(error);
    }
    const questionId = req.params.id;
    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    await Question.findByIdAndDelete(questionId);
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
const uploadQuestionImageController = async (req, res, next) => {
  //TODO: implement upload logic for cloudary or s3
  try {
    if (!req.file) return res.status(400).json({ message: "Upload question image is require" });
    const imagePath = `/uploads/questions/${req.file.filename}`;
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const fullUrl = `${proto}://${host}${imagePath}`;
    res.status(200).json({ success: true, message: "Thumbnail uploaded successfully", data: { thumbnail: fullUrl } });
  }
  catch (error) {
    return next(error);
  }
}
const uploadQuestionOptionController = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Upload option image is require" });
    const imagePath = `/uploads/options/${req.file.filename}`;
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const fullUrl = `${proto}://${host}${imagePath}`;
    res.status(200).json({ success: true, message: "Option image uploaded successfully", data: { thumbnail: fullUrl } });
  } catch (error) {
    return next(error);
  }
};
const uploadQuestionExplanationController = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Explanation question image is require" });
    const imagePath = `/uploads/explanations/${req.file.filename}`;
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const fullUrl = `${proto}://${host}${imagePath}`;
    res.status(200).json({ success: true, message: "Explanation image uploaded successfully", data: { thumbnail: fullUrl } });
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  getAllQuestionController,
  getQuestionByIdController,
  createQuestionController,
  updateQuestionController,
  deleteQuestionController,
  uploadQuestionImageController,
  uploadQuestionOptionController,
  uploadQuestionExplanationController
};
