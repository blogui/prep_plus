const mongoose = require('mongoose');

const userAccessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userName: { type: String },
  userEmail: { type: String },
  userMobile: { type: String },
  ip: { type: String, required: true },
  country: { type: String },
  page: { type: String, required: true },
  userAgent: { type: String },
  browserName: { type: String },
  browserVersion: { type: String },
  osName: { type: String },
  osVersion: { type: String },
  deviceType: { type: String },
  deviceModel: { type: String },
  timestamp: { type: Date, default: Date.now },
  isIncognito: { type: Boolean, default: false },
  incognitoId: { type: String },
});

module.exports = mongoose.model('UserAccessLog', userAccessLogSchema);