const mongoose = require("mongoose");

const userTestProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        // Array of question IDs to ensure the same question isn't served twice
        seenQuestionIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            },
        ],
        // Summary stats for the User Profile/Dashboard
        totalAttempts: { type: Number, default: 0 },
        highestScore: { type: Number, default: 0 },
        highestPercentage: { type: Number, default: 0 },
        lastAttemptedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound unique index: one progress record per user per course
userTestProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("UserTestProgress", userTestProgressSchema);
