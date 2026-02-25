const mongoose = require("mongoose");
const Question = require("../models/Question");

exports.getQuestionsByCourseIdService = async (filters) => {
  let { courseId, difficulty, search, page = 1, limit = 10 } = filters;
  courseId = courseId?.trim();
  difficulty = difficulty?.trim();
  search = search?.trim();
  if (!courseId) throw new Error("courseId is required");
  const skip = (page - 1) * limit;
  const andConditions = [
    { courseId: new mongoose.Types.ObjectId(courseId) },
  ];

  if (difficulty) {
    andConditions.push({
      difficulty: { $regex: `^${difficulty}$`, $options: "i" },
    });
  }

  if (search) {
    andConditions.push({
      $or: [
        { questionText: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ],
    });
  }
  const matchStage = { $and: andConditions };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        questionText: 1,
        questionImage: 1,
        options: 1,
        explanation: 1,
        difficulty: 1,
        marks: 1,
        negativeMarks: 1,
        tags: 1,
        "course.title": 1,
        "course.category": 1,
        "course.isPaid": 1,
        "user.firstName": 1,
        "user.email": 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    // { $skip: skip },
    // { $limit: parseInt(limit) },
  ];

  const [data, countArr] = await Promise.all([
    Question.aggregate(pipeline),
    Question.aggregate([
      { $match: matchStage },
      { $count: "total" },
    ]),
  ]);

  const total = countArr[0]?.total || 0;

  return {
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalResults: total,
    data,
  };
};
