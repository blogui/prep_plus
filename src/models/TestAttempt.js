const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema(
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
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

testAttemptSchema.index({ userId: 1, courseId: 1, status: 1 });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
