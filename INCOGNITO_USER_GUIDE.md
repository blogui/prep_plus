# Incognito User Tracking & User Export System

## Overview
This document explains the complete solution for tracking incognito (unauthenticated) users accessing public routes and exporting user information with course details.

---

## 1. Incognito User Handling Solution

### Problem
Public routes need to track visitor activity without requiring authentication, while maintaining the ability to distinguish between authenticated and incognito users.

### Solution Architecture

#### A. Database Model Enhancement
**File:** `src/models/UserAccessLog.js`

```javascript
// New fields added:
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  // ... existing fields ...
  userMobile: { type: String },           // Captures authenticated user phone
  isIncognito: { type: Boolean, default: false },  // Flags incognito sessions
  incognitoId: { type: String },          // Session tracker for incognito users
}
```

**Key Changes:**
- `userId` now optional (for incognito users)
- `isIncognito` flag to identify public/guest access
- `incognitoId` for session tracking without authentication

---

#### B. Middleware Stack

**For Authenticated Routes:** `src/middleware/authenticate.js`
```javascript
// Logs access with full user details
UserAccessLog.create({
  userId: user._id,
  userName: user.name,
  userEmail: user.email,
  userMobile: user.mobile,  // NEW
  isIncognito: false,        // NEW
  // ... IP, Country, Browser, OS, Device info
});
```

**For Public Routes:** `src/middleware/logPublicAccess.js` (NEW)
```javascript
// Logs incognito access with session tracking
UserAccessLog.create({
  userId: null,
  userName: 'Incognito User',
  userEmail: null,
  isIncognito: true,
  incognitoId: sessionId,  // Generated from header or randomized
  // ... IP, Country, Browser, OS, Device info
});

// Returns session ID in response header for frontend to persist
res.setHeader('X-Session-Id', incognitoId);
```

---

#### C. Frontend Implementation

**Session Persistence:**
```javascript
// Client-side: Persist and send incognito session ID
const sessionId = localStorage.getItem('incognito_session_id') 
  || crypto.randomUUID();
localStorage.setItem('incognito_session_id', sessionId);

// Include in all public route requests
headers['X-Session-Id'] = sessionId;
```

---

### Usage in Application

**1. Apply to Public Routes:**
```javascript
// server.js or main app file
const logPublicAccess = require('./middleware/logPublicAccess');

// For routes like /home, /about, /courses (without auth)
app.use(logPublicAccess);

// Then your public routes
app.get('/home', (req, res) => { /* ... */ });
app.get('/courses', (req, res) => { /* ... */ });
```

**2. Apply to Protected Routes:**
```javascript
// Already using authenticate middleware
app.get('/api/user-profile', authenticate, userController.getProfile);
```

---

## 2. User Information Export System

### Features
Export user data with complete profile and course enrollment information.

### API Endpoint

**Route:** `POST /api/user-access/export-user-details`
**Authentication:** Required (Admin only)

**Request:**
```json
{
  "userIds": ["userId1", "userId2", "userId3"]
}
```

**Response:** CSV file download
```
User ID | Name | Email | Mobile | Premium | Join Date | Total Courses | Course Name | Category | Highest Score | Highest % | Attempts | Last Attempted
```

---

### Backend Implementation

**File:** `src/controller/userAccessController.js`

```javascript
const exportUserDetails = async (req, res, next) => {
  const { userIds } = req.body;

  // Fetch user base info
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name email mobile isPremium createdAt');

  // Fetch course progress for each user
  const progress = await UserTestProgress.find({ userId: { $in: userIds } })
    .populate('courseId', 'title category');

  // Generate CSV with rows for each user-course combination
  // If no courses: single row with user info and "N/A" courses
  // If courses: one row per course with user info repeated
};
```

---

### Frontend Integration

**File:** `frontend/src/components/UserListModal.jsx`

**Features:**
1. **Select Multiple Users**
   - Checkboxes for individual user selection
   - "Select All" header checkbox for bulk selection
   - Selection counter in footer

2. **Export Button**
   - Appears only when users are selected
   - Shows loading state ("Exporting...")
   - Disabled until selection made

3. **User Selection UI**
   ```jsx
   <td className="px-6 py-4">
     <input
       type="checkbox"
       checked={selectedUsers.has(user.userId)}
       onChange={() => handleSelectUser(user.userId)}
       className="w-4 h-4 rounded border-gray-300 text-purple-600"
     />
   </td>
   ```

**Export Flow:**
```javascript
handleExport = async () => {
  const userIds = Array.from(selectedUsers);
  await api.exportUserDetails(userIds);  // POST to backend
  // CSV downloads automatically
};
```

---

### API Service Helper

**File:** `frontend/src/services/api.js`

```javascript
exportUserDetails: async (userIds) => {
  const response = await request('/user-access/export-user-details', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });

  // Download as CSV file
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `user-details-${Date.now()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
```

---

## 3. CSV Export Format

### Column Structure

| Column | Source | Example |
|--------|--------|---------|
| User ID | User._id | `507f1f77bcf86cd799439011` |
| Name | User.name | `John Doe` |
| Email | User.email | `john@example.com` |
| Mobile | User.mobile | `9876543210` |
| Premium | User.isPremium | `Yes` / `No` |
| Join Date | User.createdAt | `May 12, 2026` |
| Total Courses | Count | `5` |
| Course Name | UserTestProgress→Course.title | `JavaScript Mastery` |
| Category | Course.category | `Programming` |
| Highest Score | UserTestProgress.highestScore | `850` |
| Highest % | UserTestProgress.highestPercentage | `85%` |
| Attempts | UserTestProgress.totalAttempts | `12` |
| Last Attempted | UserTestProgress.lastAttemptedAt | `May 10, 2026` |

### Rows Logic
- **User with 0 courses:** Single row with user data, "N/A" in course columns
- **User with N courses:** N rows, first row has user data + first course, subsequent rows have course data only

---

## 4. Database Indexes

### Recommended Indexes
```javascript
// UserAccessLog indexes
userAccessLogSchema.index({ userId: 1, timestamp: -1 });        // For user activity timeline
userAccessLogSchema.index({ isIncognito: 1, timestamp: -1 });   // For incognito tracking
userAccessLogSchema.index({ incognitoId: 1 });                  // For session lookup
userAccessLogSchema.index({ country: 1, timestamp: -1 });       // For geographic analysis

// User indexes (existing)
userSchema.index({ name: 'text', email: 'text' });
```

---

## 5. Privacy & Security Considerations

### Data Protection
1. **Incognito Users**
   - No PII stored (userId = null)
   - Only technical metadata (IP, browser, device)
   - Session-based tracking doesn't cross boundaries

2. **Authenticated Users**
   - Full user details logged (name, email, phone)
   - IP geolocation for fraud detection
   - Logs retained for 90 days (configurable)

3. **Export Restrictions**
   - Admin-only access required
   - Audit logged for compliance
   - Client-side encryption recommended for sensitive data

---

## 6. Analytics & Reporting

### Available Insights
1. **Geographic Distribution**
   - Top countries (authenticated + incognito)
   - Regional traffic patterns

2. **Device & Browser Analytics**
   - Popular browsers/OS/devices
   - Mobile vs desktop ratio

3. **User Behavior**
   - Page access frequency
   - Session duration (via incognitoId)
   - Course enrollment to access ratio

4. **Incognito vs Authenticated**
   - Guest traffic volume
   - Conversion rate (guest→registered)
   - Popular pages for non-registered users

---

## 7. Implementation Checklist

- [x] Update UserAccessLog model with new fields
- [x] Enhance authenticate middleware with mobile field
- [x] Create logPublicAccess middleware for public routes
- [x] Add exportUserDetails controller function
- [x] Create /user-access/export-user-details route
- [x] Update UserListModal with selection & export UI
- [x] Add exportUserDetails API helper
- [x] Create database indexes
- [x] Add error handling & validation
- [ ] Add frontend incognito session management (client-side)
- [ ] Configure route middleware in main server file
- [ ] Test end-to-end export workflow
- [ ] Add export audit logging
- [ ] Implement data retention policy

---

## 8. Future Enhancements

1. **Real-time Analytics Dashboard**
   - Live visitor count
   - Heatmaps of popular pages
   - Conversion funnel visualization

2. **Advanced Filtering**
   - Date range filters
   - Device-specific insights
   - Custom report builder

3. **Automated Exports**
   - Scheduled CSV/PDF exports
   - Email delivery
   - Data warehouse integration

4. **GDPR Compliance**
   - Automatic data deletion (configurable TTL)
   - User data download request handler
   - Incognito session anonymization

---

## Configuration

### Environment Variables
```bash
# .env
ANALYTICS_RETENTION_DAYS=90
LOG_INCOGNITO_TRAFFIC=true
EXPORT_ADMIN_ONLY=true
```

### Database TTL (Optional)
```javascript
// Auto-delete logs older than 90 days
userAccessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
```

---

## Testing

### Test Cases
1. **Incognito User Tracking**
   - Public route access → Should log with isIncognito=true
   - Session ID persistence → Should match across requests

2. **Authenticated User Tracking**
   - Protected route access → Should log with userId & isIncognito=false
   - Mobile field → Should be captured from User model

3. **Export Functionality**
   - Select single user → CSV with user data
   - Select multiple users → CSV with all users + courses
   - Select user with no courses → Single row with "N/A" courses

4. **Permissions**
   - Non-admin access → Should return 403
   - Empty userIds array → Should return 400

---

