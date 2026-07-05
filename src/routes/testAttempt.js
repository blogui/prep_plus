const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  startTestAttempt,
  getAttemptQuestion,
  submitTestAttempt,
} = require("../controller/testAttemptController");

const router = express.Router();

router.post("/start", authenticate, startTestAttempt);
router.get("/:attemptId/questions/:questionId", authenticate, getAttemptQuestion);
router.post("/:attemptId/submit", authenticate, submitTestAttempt);

module.exports = router;
