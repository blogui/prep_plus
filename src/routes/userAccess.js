const express = require('express');

const router = express.Router();

const { getUserAccessLogs, exportUserDetails } = require('../controller/userAccessController');

const authenticate = require('../middleware/authenticate');

router.get('/logs', authenticate, getUserAccessLogs);
router.post('/export-user-details', authenticate, exportUserDetails);

module.exports = router;