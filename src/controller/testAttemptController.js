const mongoose = require("mongoose");
const Course = require("../models/Course");
const Question = require("../models/Question");
const TestAttempt = require("../models/TestAttempt");
const UserTestProgress = require("../models/UserTestProgress");

const shuffleInPlace = (items) => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const startTestAttempt = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId || !isValidObjectId(courseId)) {
      const error = new Error("Valid courseId is required");
      error.status = 400;
      return next(error);
    }

    const course = await Course.findById(courseId)
      .select("totalQuestions totalMarks time duration")
      .lean();

    if (!course) {
      const error = new Error("Course not found");
      error.status = 404;
      return next(error);
    }

    const [questions, progress] = await Promise.all([
      Question.find({ courseId, active: true }).select("_id").lean(),
      UserTestProgress.findOne({ userId, courseId }).select("seenQuestionIds").lean(),
    ]);

    if (!questions.length) {
      const error = new Error("No questions available for this test yet");
      error.status = 404;
      return next(error);
    }

    const seenQuestionIds = new Set((progress?.seenQuestionIds || []).map(String));
    const unseenQuestionIds = [];
    const seenSelectedPool = [];

    questions.forEach((question) => {
      const id = question._id;
      if (seenQuestionIds.has(String(id))) {
        seenSelectedPool.push(id);
      } else {
        unseenQuestionIds.push(id);
      }
    });

    shuffleInPlace(unseenQuestionIds);
    shuffleInPlace(seenSelectedPool);

    const requestedCount = Number(course.totalQuestions) || questions.length;
    const limit = Math.min(requestedCount, questions.length);
    const selectedQuestionIds = [
      ...unseenQuestionIds,
      ...seenSelectedPool,
    ].slice(0, limit);

    const attempt = await TestAttempt.create({
      userId,
      courseId,
      questionIds: selectedQuestionIds,
    });

    res.status(201).json({
      success: true,
      message: "Test attempt started successfully",
      data: {
        attemptId: attempt._id,
        questionIds: selectedQuestionIds.map(String),
        totalQuestions: selectedQuestionIds.length,
        totalMarks: course.totalMarks || 0,
        time: course.time,
        duration: course.duration,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAttemptQuestion = async (req, res, next) => {
  try {
    const { attemptId, questionId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(attemptId) || !isValidObjectId(questionId)) {
      const error = new Error("Valid attemptId and questionId are required");
      error.status = 400;
      return next(error);
    }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId,
      status: "in_progress",
    }).select("questionIds").lean();

    if (!attempt) {
      const error = new Error("Active test attempt not found");
      error.status = 404;
      return next(error);
    }

    const isSelectedQuestion = attempt.questionIds.some(
      (selectedQuestionId) => String(selectedQuestionId) === String(questionId)
    );

    if (!isSelectedQuestion) {
      const error = new Error("Question is not part of this test attempt");
      error.status = 403;
      return next(error);
    }

    const question = await Question.findById(questionId)
      .select("questionText questionImage options explanation difficulty marks negativeMarks tags createdAt")
      .lean();

    if (!question) {
      const error = new Error("Question not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    return next(error);
  }
};

const submitTestAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { score, totalMarks } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(attemptId)) {
      const error = new Error("Valid attemptId is required");
      error.status = 400;
      return next(error);
    }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId,
    });

    if (!attempt) {
      const error = new Error("Test attempt not found");
      error.status = 404;
      return next(error);
    }

    if (attempt.status === "submitted") {
      return res.status(200).json({
        success: true,
        message: "Test attempt was already submitted",
        data: attempt,
      });
    }

    const numericScore = Number(score) || 0;
    const numericTotalMarks = Number(totalMarks) || 0;
    const currentPercentage = numericTotalMarks > 0
      ? parseFloat(((numericScore / numericTotalMarks) * 100).toFixed(2))
      : 0;

    const submittedAt = new Date();

    const progress = await UserTestProgress.findOneAndUpdate(
      { userId, courseId: attempt.courseId },
      {
        $addToSet: { seenQuestionIds: { $each: attempt.questionIds } },
        $inc: { totalAttempts: 1 },
        $max: { highestScore: numericScore, highestPercentage: currentPercentage },
        $set: { lastAttemptedAt: submittedAt },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    attempt.status = "submitted";
    attempt.score = numericScore;
    attempt.totalMarks = numericTotalMarks;
    attempt.submittedAt = submittedAt;
    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Test attempt submitted successfully",
      data: {
        attempt,
        progress,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  startTestAttempt,
  getAttemptQuestion,
  submitTestAttempt,
};
