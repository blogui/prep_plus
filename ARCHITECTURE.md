# System Architecture Diagram

## Overall System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REQUEST HANDLING LAYER                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                     PUBLIC ROUTES (No Authentication)                     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   GET /home      →  logPublicAccess Middleware  →  homeController       │
│   GET /about     →  logPublicAccess Middleware  →  aboutController      │
│   GET /courses   →  logPublicAccess Middleware  →  courseController     │
│   GET /faq       →  logPublicAccess Middleware  →  faqController        │
│                                                                           │
│   Result: UserAccessLog created with:                                   │
│   • isIncognito: true                                                   │
│   • userId: null                                                        │
│   • incognitoId: sessionId                                              │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                     PROTECTED ROUTES (JWT Required)                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   GET /api/profile            →  authenticate Middleware  →  profiles  │
│   GET /api/user-access/logs   →  authenticate Middleware  →  analytics │
│   POST /api/export/user-info  →  authenticate Middleware  →  export    │
│                                                                           │
│   Result: UserAccessLog created with:                                   │
│   • isIncognito: false                                                  │
│   • userId: user._id                                                    │
│   • userName, userEmail, userMobile populated                           │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    INCOGNITO USER TRACKING DATA FLOW                         │
└──────────────────────────────────────────────────────────────────────────────┘

  BROWSER (Frontend)
  ┌─────────────────────────────────────────┐
  │  GET /home (public route)                │
  │  Headers: X-Session-Id: session_abc123   │
  └─────────────────────────────────────────┘
         │
         ↓
  SERVER (Express)
  ┌─────────────────────────────────────────┐
  │  logPublicAccess Middleware              │
  ├─────────────────────────────────────────┤
  │  1. Extract IP from headers              │
  │     rawIp → remove ::ffff: prefix        │
  │                                          │
  │  2. Geolocate IP using geoip-lite        │
  │     ip: "203.0.113.42"  → country: "IN" │
  │                                          │
  │  3. Parse User-Agent                     │
  │     User-Agent string → UAParser         │
  │     Extract: Browser, OS, Device         │
  │                                          │
  │  4. Get/Create Session ID                │
  │     sessionId = X-Session-Id or new ID   │
  │                                          │
  │  5. Create UserAccessLog Document        │
  │     {                                    │
  │       userId: null,                      │
  │       isIncognito: true,                 │
  │       incognitoId: "session_abc123",    │
  │       ip: "203.0.113.42",               │
  │       country: "IN",                     │
  │       page: "/home",                     │
  │       browserName: "Chrome",             │
  │       osName: "Windows",                 │
  │       deviceType: "desktop"              │
  │     }                                    │
  │                                          │
  │  6. Return Session ID in header          │
  │     X-Session-Id: session_abc123        │
  │                                          │
  └─────────────────────────────────────────┘
         │
         ↓
  DATABASE (MongoDB)
  ┌─────────────────────────────────────────┐
  │  UserAccessLog Collection                │
  ├─────────────────────────────────────────┤
  │  Stores incognito session history       │
  │  Indexes on: isIncognito, incognitoId   │
  └─────────────────────────────────────────┘
```

---

## Export System Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      USER EXPORT DATA FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────┘

  ADMIN DASHBOARD
  ┌─────────────────────────────────────────┐
  │  AdminUserAccessTab Component            │
  │  • Click "Unique Users" Card            │
  │  • UserListModal Opens                  │
  │  • Fetches User List (API Call #1)      │
  │  • Shows Checkboxes                     │
  │  • Select Users                         │
  │  • Click "Export Selected" Button        │
  └─────────────────────────────────────────┘
         │
         ↓ (API Call #2: POST /export-user-details)
  
  BACKEND CONTROLLER
  ┌─────────────────────────────────────────┐
  │  userAccessController.exportUserDetails  │
  ├─────────────────────────────────────────┤
  │                                          │
  │  1. Validate Admin Role                  │
  │     if (req.user.role !== 'admin')       │
  │       → return 403 Forbidden             │
  │                                          │
  │  2. Query User Collection                │
  │     db.users.find({                      │
  │       _id: { $in: userIds }              │
  │     }).select(...)                       │
  │     Result: 3 users                      │
  │                                          │
  │  3. For Each User:                       │
  │     Query UserTestProgress               │
  │     → Find courses with scores           │
  │                                          │
  │  4. Populate Course Details              │
  │     userId → courseId                    │
  │     → get courseName, category           │
  │                                          │
  │  5. Join Data                            │
  │     User + UserTestProgress + Course     │
  │     Result: User with array of courses   │
  │                                          │
  │  6. Generate CSV                         │
  │     Headers: [User ID, Name, Email, ...] │
  │     Rows: One per user-course combo      │
  │     User with 0 courses: 1 row (N/A)     │
  │     User with 3 courses: 3 rows          │
  │                                          │
  │  7. Send CSV File                        │
  │     Content-Type: text/csv               │
  │     Content-Disposition: attachment      │
  │                                          │
  └─────────────────────────────────────────┘
         │
         ↓
  
  DATABASE QUERIES (In Parallel)
  ┌──────────────┐  ┌──────────────────┐  ┌─────────────┐
  │ User Table   │  │ UserTestProgress │  │ Course Tbl  │
  ├──────────────┤  ├──────────────────┤  ├─────────────┤
  │ _id          │  │ userId           │  │ _id         │
  │ name         │  │ courseId         │  │ title       │
  │ email        │  │ highestScore     │  │ category    │
  │ mobile       │  │ attempts         │  │             │
  │ isPremium    │  │ lastAttemptedAt  │  │             │
  │ createdAt    │  │                  │  │             │
  └──────────────┘  └──────────────────┘  └─────────────┘
         ↓                  ↓                      ↓
         └──────────────────┼──────────────────────┘
                            │
                    Joined Result:
                    ┌──────────────────────────┐
                    │ User + Courses Array     │
                    │ • userId: "id1"          │
                    │ • name: "John"           │
                    │ • courses: [             │
                    │    {courseName, score}   │
                    │  ]                       │
                    └──────────────────────────┘
                            │
                            ↓
                    CSV Generation:
                    ┌──────────────────────────┐
                    │ Headers: [User, Course]  │
                    │ Row 1: John, JS Basics   │
                    │ Row 2: , Advanced JS     │
                    │ Row 3: Jane, React       │
                    └──────────────────────────┘
         
  BROWSER
  ┌─────────────────────────────────────────┐
  │  Download CSV File                       │
  │  user-details-{timestamp}.csv            │
  │                                          │
  │  Rows:                                   │
  │  User ID | Name | Email | Mobile | ... │
  │  id1     | John | john@ | 9876  | ... │
  │  (blank) | (blank) | (blank) | | ...   │
  │  id2     | Jane | jane@ | 5432  | ... │
  │                                          │
  └─────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     DATABASE COLLECTION RELATIONSHIPS                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│ User Collection         │
├─────────────────────────┤
│ _id: ObjectId           │
│ name: String            │
│ email: String (unique)  │
│ mobile: String          │← NEW field captured
│ isPremium: Boolean      │
│ createdAt: Date         │
│ ... (other fields)      │
└─────────────────────────┘
         │ 1
         │ (userId)
         │ n
         ↓
┌─────────────────────────────────────┐
│ UserAccessLog Collection (NEW)      │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ userId: ObjectId (ref: User) (opt)  │ ← NEW: optional for incognito
│ userName: String                    │
│ userEmail: String                   │
│ userMobile: String                  │ ← NEW field
│ isIncognito: Boolean (default:false)│ ← NEW field
│ incognitoId: String                 │ ← NEW field
│ ip: String (indexed)                │
│ country: String (indexed)           │
│ page: String                        │
│ userAgent: String                   │
│ browserName, osName, deviceType     │
│ timestamp: Date (indexed)           │
│                                     │
│ Indexes:                            │
│ • userId + timestamp (DESC)         │
│ • isIncognito + timestamp (DESC)    │
│ • incognitoId                       │
│ • country + timestamp (DESC)        │
└─────────────────────────────────────┘

         │ n (courseId)
         │
         ↓ 1
┌─────────────────────────────────────┐
│ UserTestProgress Collection         │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ userId: ObjectId (ref: User)        │
│ courseId: ObjectId (ref: Course)    │
│ highestScore: Number                │
│ highestPercentage: Number           │
│ totalAttempts: Number               │
│ lastAttemptedAt: Date               │
│ ... (other fields)                  │
└─────────────────────────────────────┘
         │ 1
         │ (courseId)
         │ n
         ↓
┌─────────────────────────────────────┐
│ Course Collection                   │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ title: String                       │
│ category: String                    │
│ description: String                 │
│ ... (other fields)                  │
└─────────────────────────────────────┘

KEY RELATIONSHIPS:
• User (1) ← many (UserAccessLog)
• User (1) ← many (UserTestProgress)
• Course (1) ← many (UserTestProgress)

EXPORT QUERY PATH:
User → UserTestProgress → Course
       (join on courseId)
```

---

## Component Architecture (Frontend)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         REACT COMPONENT HIERARCHY                            │
└──────────────────────────────────────────────────────────────────────────────┘

AdminDashboard
│
├── AdminUserAccessTab (Main Component)
│   ├── State Management:
│   │   ├── logs: UserAccessLog[]
│   │   ├── analytics: {totalLogs, uniqueUsers, ...}
│   │   ├── search, country, pageName (filters)
│   │   ├── page, limit (pagination)
│   │   ├── userList: User[]
│   │   └── showUserModal: boolean
│   │
│   ├── Sub-Components:
│   │   ├── Header Section
│   │   │   ├── Title: "Access Analytics"
│   │   │   └── Buttons: [Export CSV] [Reset]
│   │   │
│   │   ├── Analytics Grid (5 cards)
│   │   │   ├── Card: Total Page Views (1,245)
│   │   │   ├── Card: Unique Users (287) ← CLICKABLE
│   │   │   ├── Card: Unique Pages (45)
│   │   │   ├── Card: Top Country (US)
│   │   │   └── Card: Top Browser (Chrome)
│   │   │
│   │   ├── Detailed Stats (3 columns)
│   │   │   ├── Top Pages
│   │   │   ├── Top Devices
│   │   │   └── Top Operating Systems
│   │   │
│   │   ├── Filters Section
│   │   │   ├── Search Input (name/email/IP)
│   │   │   ├── Country Input
│   │   │   ├── Page/Route Input
│   │   │   └── Buttons: [Apply] [Clear]
│   │   │
│   │   ├── Logs Table
│   │   │   ├── Column: User (name + email)
│   │   │   ├── Column: Page (friendly name + raw route)
│   │   │   ├── Column: Country
│   │   │   ├── Column: Browser
│   │   │   ├── Column: Device + OS
│   │   │   └── Column: Timestamp
│   │   │
│   │   └── Pagination
│   │       ├── Info: "Page 1 of 5"
│   │       └── Buttons: [Previous] [Next]
│   │
│   └── CHILDREN:
│       │
│       └── UserListModal (Opened when clicking "Unique Users")
│           ├── Props:
│           │   ├── isOpen: boolean
│           │   ├── onClose: function
│           │   ├── users: User[]
│           │   └── loading: boolean
│           │
│           ├── State:
│           │   ├── selectedUsers: Set<userId>
│           │   └── exporting: boolean
│           │
│           ├── Features:
│           │   ├── User Table
│           │   │   ├── Checkbox Column (select individual)
│           │   │   ├── User Column (avatar + name)
│           │   │   ├── Email Column
│           │   │   ├── Page Views Badge
│           │   │   └── Last Seen Column
│           │   │
│           │   ├── Header
│           │   │   ├── Title: "Unique Users"
│           │   │   └── Close Button (X)
│           │   │
│           │   └── Footer
│           │       ├── Selection Counter
│           │       │   (e.g., "5 users selected")
│           │       │
│           │       ├── Select All Checkbox
│           │       │   (in table header)
│           │       │
│           │       └── Export Button
│           │           (appears only when users selected)
│           │           Shows "Exporting..." during load
│           │
│           └── Handlers:
│               ├── handleSelectUser(userId)
│               ├── handleSelectAll()
│               └── handleExport()
│                   → api.exportUserDetails(userIds)
│                   → triggers CSV download

API SERVICES:
├── api.getUserAccessLogs(params)
│   GET /api/user-access/logs
│   Returns: {data, analytics, pagination, users}
│
├── api.getUserAccessUsers(params)
│   GET /api/user-access/logs?listUsers=true
│   Returns: users array
│
└── api.exportUserDetails(userIds)
    POST /api/user-access/export-user-details
    Body: {userIds: [...]}
    Response: CSV blob → triggers download

UTILITIES:
├── getPageName(route)
│   Converts: "/test/123" → "Test Details"
│   Maps raw routes to friendly names
│
└── pageNameMap
    ├── Exact routes (16 patterns)
    └── Regex patterns (4 patterns)
```

---

## Middleware Stack

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE EXECUTION FLOW                               │
└──────────────────────────────────────────────────────────────────────────────┘

EXPRESS APP
│
└── app.use(logPublicAccess)
    │
    ├─→ [ALL REQUESTS]
    │   ├─→ If authenticated (req.user exists)
    │   │   └─→ Skip logging (already done by authenticate)
    │   │
    │   └─→ If not authenticated
    │       ├─→ Extract IP
    │       ├─→ Parse User-Agent
    │       ├─→ Geolocate
    │       ├─→ Create UserAccessLog (isIncognito: true)
    │       └─→ Set X-Session-Id response header
    │
    └─→ next() → Continue to route handler

ROUTE: GET /home (public)
│
└── [No authentication middleware]
    └─→ homeController
        └─→ Returns page

ROUTE: GET /api/user/profile (protected)
│
├── app.use(authenticate)
│   ├─→ Extract JWT from Authorization header
│   ├─→ Verify JWT signature & expiry
│   ├─→ Load user from database (with mobile field)
│   ├─→ Attach req.user = {id, role, name, email, mobile}
│   ├─→ Create UserAccessLog (isIncognito: false, userId: user._id)
│   └─→ next() → Continue to route handler
│
└── profileController
    └─→ Returns user profile

ROUTE: POST /api/user-access/export-user-details (protected)
│
├── app.use(authenticate)
│   └─→ (same as above)
│
├── Check Authorization
│   └─→ if (req.user.role !== 'admin') return 403
│
└── exportUserDetails Controller
    ├─→ Query User collection
    ├─→ Query UserTestProgress collection
    ├─→ Join with Course collection
    ├─→ Generate CSV
    └─→ Send file to client
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING ARCHITECTURE                           │
└──────────────────────────────────────────────────────────────────────────────┘

AUTHENTICATION ERRORS
│
├── No Authorization Header
│   └─→ 401: "No token provided. Please log in."
│
├── Invalid JWT Signature
│   └─→ 401: "Invalid token. Please log in again."
│
├── JWT Expired
│   └─→ 401: "Session expired. Please log in again."
│   └─→ Frontend triggers silent refresh
│
└── User Not Found in DB
    └─→ 401: "User no longer exists."

AUTHORIZATION ERRORS
│
└── Not Admin (req.user.role !== 'admin')
    └─→ 403: "Access denied"

VALIDATION ERRORS (Export)
│
├── Missing userIds
│   └─→ 400: "Please provide userIds array"
│
└── Empty userIds array
    └─→ 400: "Please provide userIds array"

DATABASE ERRORS
│
├── Query fails
│   └─→ Caught in try-catch
│   └─→ Passed to next(err) → Global error handler
│
└── Connection timeout
    └─→ 500: "Database connection error"

LOGGING ERRORS (logPublicAccess)
│
├── Geoip lookup fails
│   └─→ Continues (country: "Unknown")
│   └─→ Logged in console, doesn't block request
│
└── MongoDB write fails
    └─→ .catch() handler silently logs
    └─→ Doesn't block user request

FRONTEND ERRORS
│
├── API call fails
│   ├─→ Show error message: "Failed to load logs"
│   └─→ Log to console
│
├── CSV download fails
│   └─→ alert("Export failed: {error}")
│
└── Network timeout
    └─→ Automatic retry logic (via request interceptor)
```

---

