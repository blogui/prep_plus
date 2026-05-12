# Quick Implementation Guide

## Step 1: Apply Middleware to Public Routes

**File:** `server.js` (or main Express app file)

```javascript
const express = require('express');
const logPublicAccess = require('./src/middleware/logPublicAccess');
const authenticate = require('./src/middleware/authenticate');

const app = express();

// Apply public access logging BEFORE routes
app.use(logPublicAccess);

// ===== PUBLIC ROUTES (No authentication required) =====
app.get('/home', homeController.getHome);
app.get('/about', aboutController.getAbout);
app.get('/courses', courseController.getAllCourses);
app.get('/categories', categoryController.getAll);
app.get('/blogs', blogController.getAllBlogs);
app.get('/faq', staticController.getFAQ);

// ===== PROTECTED ROUTES (Authentication required) =====
// These routes will use authenticate middleware instead
app.get('/api/user/profile', authenticate, userController.getProfile);
app.get('/api/user-access/logs', authenticate, userAccessController.getUserAccessLogs);
app.post('/api/user-access/export-user-details', authenticate, userAccessController.exportUserDetails);
```

## Step 2: Add Database Indexes

**File:** Add to `src/models/UserAccessLog.js`

```javascript
// Add these indexes to optimize queries
userAccessLogSchema.index({ userId: 1, timestamp: -1 });
userAccessLogSchema.index({ isIncognito: 1, timestamp: -1 });
userAccessLogSchema.index({ incognitoId: 1 });
userAccessLogSchema.index({ country: 1, timestamp: -1 });
```

Run in MongoDB:
```javascript
db.useraccesslogs.createIndex({ userId: 1, timestamp: -1 });
db.useraccesslogs.createIndex({ isIncognito: 1, timestamp: -1 });
db.useraccesslogs.createIndex({ incognitoId: 1 });
db.useraccesslogs.createIndex({ country: 1, timestamp: -1 });
```

## Step 3: Enable Frontend Session Management (Optional but Recommended)

**File:** `frontend/src/services/api.js`

Add at the top of the file:

```javascript
// Initialize incognito session ID
const initializeIncognitoSession = () => {
  let sessionId = localStorage.getItem('incognito_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('incognito_session_id', sessionId);
  }
  return sessionId;
};

const INCOGNITO_SESSION_ID = initializeIncognitoSession();
```

Update the request helper:

```javascript
const request = async (path, options = {}) => {
  const headers = options.headers || {};
  
  // Add incognito session ID
  headers['X-Session-Id'] = INCOGNITO_SESSION_ID;
  
  // ... rest of request logic
};
```

## Step 4: Testing the Implementation

### Test Incognito Tracking
```bash
# Access public route without authentication
curl -H "X-Session-Id: test-session-123" http://localhost:5000/home

# Check database - should log with isIncognito: true
db.useraccesslogs.findOne({ isIncognito: true })
```

### Test User Export
```bash
# From frontend, click "Unique Users" → select users → click "Export Selected"
# Should download CSV with user details and courses

# Or test via API:
curl -X POST http://localhost:5000/api/user-access/export-user-details \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"userIds":["userId1","userId2"]}'
```

## Step 5: Verify in Admin Dashboard

1. **Login as Admin**
2. **Go to Admin → Access Analytics Tab**
3. **Click "Unique Users" button** (purple card with eye icon)
4. **UserListModal should open** showing:
   - All unique users
   - Page view count
   - Last seen timestamp
   - ✓ Checkboxes for selection
   - ✓ "Export Selected" button (when users selected)
5. **Select users and click "Export Selected"**
6. **CSV file should download** with columns:
   - User ID, Name, Email, Mobile, Premium, Join Date
   - Course Name, Category, Highest Score, Attempts, etc.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PUBLIC ROUTE (e.g., /home)                             │
│  ↓                                                       │
│  logPublicAccess Middleware                             │
│  ├─ Extract IP & geolocate                              │
│  ├─ Parse User-Agent                                    │
│  ├─ Get incognitoId from header                         │
│  ├─ Create UserAccessLog with:                          │
│  │  • userId: null                                      │
│  │  • isIncognito: true                                 │
│  │  • incognitoId: sessionId                            │
│  ├─ Return sessionId in X-Session-Id header             │
│  └─ Continue to route handler                           │
│                                                          │
│  PROTECTED ROUTE (e.g., /api/user/profile)             │
│  ↓                                                       │
│  authenticate Middleware                                │
│  ├─ Verify JWT                                          │
│  ├─ Load user with mobile field                         │
│  ├─ Create UserAccessLog with:                          │
│  │  • userId: user._id                                  │
│  │  • userName, userEmail, userMobile                   │
│  │  • isIncognito: false                                │
│  └─ Continue to route handler                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Export Flow

```
┌──────────────────────────────────────────────────────────┐
│             USER EXPORT FLOW                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Admin Dashboard                                         │
│ ↓                                                       │
│ Click "Unique Users" Card                              │
│ ↓                                                       │
│ UserListModal Opens                                    │
│ ├─ Fetches user list from API                          │
│ ├─ Shows checkboxes for each user                      │
│ └─ "Export Selected" button appears when selected      │
│ ↓                                                       │
│ Select Users + Click "Export Selected"                 │
│ ↓                                                       │
│ api.exportUserDetails(userIds)                         │
│ ↓                                                       │
│ POST /api/user-access/export-user-details              │
│ └─ Backend: Join User + UserTestProgress + Course      │
│ ↓                                                       │
│ Generate CSV:                                          │
│ ├─ Headers: User ID, Name, Email, Mobile, ...         │
│ ├─ Rows: One per user-course combination               │
│ └─ Cells: User data repeated per course row            │
│ ↓                                                       │
│ Response: CSV File (Content-Type: text/csv)           │
│ ↓                                                       │
│ Browser Downloads: user-details-{timestamp}.csv       │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: "Incognito users not being logged"
**Solution:** 
- Check that `logPublicAccess` middleware is applied BEFORE routes
- Verify request includes `X-Session-Id` header
- Check database for logs with `isIncognito: true`

### Issue: "Export button not showing"
**Solution:**
- Ensure you're logged in as admin
- Select at least one user (checkboxes must have checks)
- Check browser console for errors

### Issue: "CSV download returns 403"
**Solution:**
- Verify your user has `role: 'admin'` in database
- Check `exportUserDetails` controller permission check
- Verify JWT token is valid

### Issue: "Mobile field is null in export"
**Solution:**
- Ensure User model has `mobile` field
- Users must have mobile number set in their profile
- Check User.findById select includes `mobile`

---

## Files Modified/Created

✓ `src/models/UserAccessLog.js` - Added userMobile, isIncognito, incognitoId fields
✓ `src/middleware/authenticate.js` - Capture mobile field, set isIncognito: false
✓ `src/middleware/logPublicAccess.js` - NEW middleware for public route logging
✓ `src/controller/userAccessController.js` - Added exportUserDetails function
✓ `src/routes/userAccess.js` - Added export route
✓ `frontend/src/components/UserListModal.jsx` - Added selection & export UI
✓ `frontend/src/services/api.js` - Added exportUserDetails helper

---
