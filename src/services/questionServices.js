const mongoose = require("mongoose");
const Question = require("../models/Question");

/**
 * In-memory session store - fallback when Redis is unavailable
 * Used for storing test sessions on a single server instance
 */
const memorySessionStore = new Map();

/**
 * Clean up expired sessions from memory store
 * Runs periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memorySessionStore.entries()) {
    if (value.expiresAt < now) {
      memorySessionStore.delete(key);
    }
  }
}, 60000); // Run every minute

/**
 * Get or set a session value using Redis (with memory fallback)
 */
const getSessionValue = async (key) => {
  const redis = require("../config/redisClient");
  
  // Try Redis first (if it exists and might be connected)
  try {
    if (redis && typeof redis.get === 'function') {
      const value = await redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
    }
  } catch (err) {
    console.warn("Redis get failed, falling back to memory:", err.message);
  }
  
  // Fallback to memory store
  const sessionData = memorySessionStore.get(key);
  if (sessionData && sessionData.expiresAt > Date.now()) {
    return sessionData.value;
  }
  
  if (sessionData && sessionData.expiresAt <= Date.now()) {
    memorySessionStore.delete(key);
  }
  
  return null;
};

/**
 * Set a session value using Redis (with memory fallback)
 */
const setSessionValue = async (key, value, ttlSeconds) => {
  const redis = require("../config/redisClient");
  
  // Try Redis first (if it exists and might be connected)
  try {
    if (redis && typeof redis.setEx === 'function') {
      await redis.setEx(key, ttlSeconds, JSON.stringify(value));
      return;
    }
  } catch (err) {
    console.warn("Redis set failed, falling back to memory:", err.message);
  }
  
  // Fallback to memory store
  memorySessionStore.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000),
  });
};

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

/**
 * Start a test session - filter questions, randomize, and store in Redis
 * Returns only question IDs (not full question data) for IP protection
 * 
 * @param {string} courseId - MongoDB ObjectId of the course
 * @param {string} userId - MongoDB ObjectId of the user (optional for guests)
 * @param {number} totalQuestions - Number of questions to select
 * @returns {Promise} { sessionId, questionIds: [], totalQuestions, testStartedAt }
 */
exports.startTestSessionService = async (courseId, userId, totalQuestions = null) => {
  const Course = require("../models/Course");
  const UserTestProgress = require("../models/UserTestProgress");
  const crypto = require("crypto");

  if (!courseId) throw new Error("courseId is required");

  // Step 1: Get course details (including total questions if not specified)
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const questionsToSelect = totalQuestions || course.totalQuestions || 10;

  // Step 2: Fetch all active questions for this course
  const allQuestions = await Question.find(
    { courseId: new mongoose.Types.ObjectId(courseId), active: true },
    { _id: 1 }
  ).lean();

  if (allQuestions.length === 0) {
    throw new Error("No questions available for this course");
  }

  // Step 3: Get user's seen questions (if logged in)
  let seenQuestionIds = new Set();
  if (userId) {
    try {
      const progress = await UserTestProgress.findOne({ 
        userId: new mongoose.Types.ObjectId(userId), 
        courseId: new mongoose.Types.ObjectId(courseId) 
      });
      if (progress?.seenQuestionIds?.length > 0) {
        seenQuestionIds = new Set(progress.seenQuestionIds.map(id => id.toString()));
      }
    } catch (err) {
      // If progress fetch fails, treat as no prior questions
      console.warn("Could not fetch user progress:", err.message);
    }
  }

  // Step 4: Split questions into unseen and seen pools
  const unseenQuestions = allQuestions.filter(q => !seenQuestionIds.has(q._id.toString()));
  const seenQuestions = allQuestions.filter(q => seenQuestionIds.has(q._id.toString()));

  // Step 5: Shuffle and select questions (prioritize unseen)
  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);
  
  let selectedQuestionIds = [];
  
  if (unseenQuestions.length >= questionsToSelect) {
    // Enough unseen questions
    selectedQuestionIds = shuffleArray([...unseenQuestions]).slice(0, questionsToSelect);
  } else if (unseenQuestions.length > 0) {
    // Mix unseen + seen
    const needed = questionsToSelect - unseenQuestions.length;
    selectedQuestionIds = [
      ...unseenQuestions,
      ...shuffleArray([...seenQuestions]).slice(0, needed)
    ];
  } else {
    // All seen - reshuffle them
    selectedQuestionIds = shuffleArray([...seenQuestions]).slice(0, questionsToSelect);
  }

  // Convert to strings
  selectedQuestionIds = selectedQuestionIds.map(q => q._id.toString());

  // Step 6: Generate unique session ID
  const sessionId = `sess_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;

  // Step 7: Store session in Redis/Memory (2 hour expiry + 10 minute buffer for submission)
  const sessionData = {
    sessionId,
    userId,
    courseId,
    selectedQuestionIds,
    totalQuestions: selectedQuestionIds.length,
    testStartedAt: new Date().toISOString(),
  };

  // Store in Redis with 2.5 hour TTL (test duration + buffer)
  const ttl = 2.5 * 60 * 60; // 9000 seconds
  await setSessionValue(
    `test:session:${sessionId}`,
    sessionData,
    ttl
  );

  // Log session creation for debugging
  console.log(`✅ Test session created - sessionId: ${sessionId}, questions: ${selectedQuestionIds.length}`);

  return {
    sessionId,
    questionIds: selectedQuestionIds,
    totalQuestions: selectedQuestionIds.length,
    testStartedAt: sessionData.testStartedAt,
  };
};

/**
 * Validate and retrieve a question for a test session
 * Ensures the question belongs to the user's current session
 * 
 * @param {string} questionId - MongoDB ObjectId of the question
 * @param {string} sessionId - Test session ID
 * @returns {Promise} Question data with all fields (for this user's session only)
 */
exports.getQuestionForTestSessionService = async (questionId, sessionId) => {
  if (!questionId || !sessionId) {
    throw new Error("questionId and sessionId are required");
  }

  // Step 1: Validate session exists and is active
  const sessionData = await getSessionValue(`test:session:${sessionId}`);
  if (!sessionData) {
    throw new Error("Test session expired or invalid");
  }

  // Step 2: Check if this question is in the user's session
  if (!sessionData.selectedQuestionIds.includes(questionId)) {
    throw new Error("Unauthorized - Question not in user's test session");
  }

  // Step 3: Fetch and return the question
  const question = await Question.findById(questionId).lean();
  if (!question) {
    throw new Error("Question not found");
  }

  // Refresh session TTL on each question fetch (keeps session alive during test)
  const ttl = 2.5 * 60 * 60;
  await setSessionValue(
    `test:session:${sessionId}`,
    sessionData,
    ttl
  );

  // Log for debugging
  console.log(`📝 Question fetched - sessionId: ${sessionId}, questionId: ${questionId}`);

  return question;
};
