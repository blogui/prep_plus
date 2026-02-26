const UserTestProgress = require("../models/UserTestProgress");
const Course = require("../models/Course");

/**
 * Upsert (create or update) a user's test progress record after submitting a test.
 *
 * Body: { userId, courseId, questionIds: [...], score, totalMarks }
 *
 * - First attempt  → creates a new document
 * - Re-attempt     → appends questionIds to seenQuestionIds, increments totalAttempts,
 *                    updates highestScore / highestPercentage if better, refreshes lastAttemptedAt
 */
const upsertUserTestProgress = async (req, res, next) => {
    try {
        const { userId, courseId, questionIds, score, totalMarks } = req.body;

        if (!userId || !courseId) {
            const error = new Error("userId and courseId are required");
            error.status = 400;
            return next(error);
        }

        if (!Array.isArray(questionIds)) {
            const error = new Error("questionIds must be an array");
            error.status = 400;
            return next(error);
        }

        const numericScore = Number(score) || 0;
        const numericTotalMarks = Number(totalMarks) || 0;
        const currentPercentage = numericTotalMarks > 0
            ? parseFloat(((numericScore / numericTotalMarks) * 100).toFixed(2))
            : 0;

        // findOneAndUpdate with upsert so the first attempt creates the document automatically.
        // $addToSet + $each avoids true duplicates inside seenQuestionIds.
        // $max ensures highestScore / highestPercentage are only overwritten when the new value is higher.
        const progress = await UserTestProgress.findOneAndUpdate(
            { userId, courseId },
            {
                $addToSet: { seenQuestionIds: { $each: questionIds } },
                $inc: { totalAttempts: 1 },
                $max: { highestScore: numericScore, highestPercentage: currentPercentage },
                $set: { lastAttemptedAt: new Date() },
            },
            {
                new: true,      // return the updated document
                upsert: true,   // create if not found
                setDefaultsOnInsert: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Test progress saved successfully",
            data: progress,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Get a user's test progress for a specific course.
 *
 * Query: ?userId=&courseId=
 */
const getUserTestProgress = async (req, res, next) => {
    try {
        const { userId, courseId } = req.query;

        if (!userId || !courseId) {
            const error = new Error("userId and courseId query params are required");
            error.status = 400;
            return next(error);
        }

        const progress = await UserTestProgress.findOne({ userId, courseId });

        if (!progress) {
            return res.status(200).json({
                success: true,
                message: "No progress found for this user and course",
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            message: "User test progress fetched successfully",
            data: progress,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Get all progress records for a user (one per course attempted).
 * Includes course title via populate so the frontend can display course names.
 *
 * Query: ?userId=
 */
const getAllUserProgress = async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            const error = new Error("userId query param is required");
            error.status = 400;
            return next(error);
        }

        // Fetch progress records and populate course title
        const progressRecords = await UserTestProgress.find({ userId })
            .populate("courseId", "title")
            .lean();

        // Shape data for the frontend
        const data = progressRecords.map((rec) => ({
            courseId: rec.courseId?._id || rec.courseId,
            courseName: rec.courseId?.title || "Unknown Course",
            highestPercentage: rec.highestPercentage || 0,
            highestScore: rec.highestScore || 0,
            totalAttempts: rec.totalAttempts || 0,
            lastAttemptedAt: rec.lastAttemptedAt,
        }));

        res.status(200).json({
            success: true,
            message: "All user progress fetched successfully",
            data,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    upsertUserTestProgress,
    getUserTestProgress,
    getAllUserProgress,
};
