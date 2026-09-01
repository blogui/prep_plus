# Analytics & Query Examples

## MongoDB Queries for Insights

### 1. Incognito vs Authenticated Users

```javascript
// Breakdown of traffic
db.useraccesslogs.aggregate([
  {
    $group: {
      _id: '$isIncognito',
      count: { $sum: 1 },
      uniqueUsers: { $addToSet: '$userId' },
      uniqueIncognitoSessions: { $addToSet: '$incognitoId' }
    }
  },
  {
    $project: {
      _id: 0,
      type: { $cond: ['$_id', 'Incognito', 'Authenticated'] },
      totalAccess: '$count',
      uniqueAuthUsers: { $size: { $filter: { input: '$uniqueUsers', as: 'uid', cond: { $ne: ['$$uid', null] } } } },
      uniqueIncognitoSessions: { $size: '$uniqueIncognitoSessions' }
    }
  }
])

// Result:
// [
//   { type: 'Authenticated', totalAccess: 5234, uniqueAuthUsers: 128, uniqueIncognitoSessions: 0 },
//   { type: 'Incognito', totalAccess: 12847, uniqueAuthUsers: 0, uniqueIncognitoSessions: 1543 }
// ]
```

### 2. Top Pages for Incognito Users

```javascript
db.useraccesslogs.aggregate([
  { $match: { isIncognito: true } },
  { $group: { _id: '$page', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      page: '$_id',
      visits: '$count',
      percentage: { $round: [{ $multiply: [{ $divide: ['$count', 12847] }, 100] }, 2] }
    }
  }
])

// Find popular pages that don't require login
```

### 3. Geographic Distribution (Incognito Only)

```javascript
db.useraccesslogs.aggregate([
  { $match: { isIncognito: true } },
  {
    $group: {
      _id: '$country',
      uniqueSessions: { $addToSet: '$incognitoId' },
      totalAccess: { $sum: 1 },
      topBrowser: { $first: '$browserName' }
    }
  },
  {
    $project: {
      _id: 0,
      country: '$_id',
      uniqueSessions: { $size: '$uniqueSessions' },
      totalAccess: '$totalAccess',
      topBrowser: '$topBrowser'
    }
  },
  { $sort: { totalAccess: -1 } },
  { $limit: 10 }
])
```

### 4. Session Duration Analysis (Incognito)

```javascript
db.useraccesslogs.aggregate([
  { $match: { isIncognito: true } },
  {
    $group: {
      _id: '$incognitoId',
      firstAccess: { $min: '$timestamp' },
      lastAccess: { $max: '$timestamp' },
      pageViews: { $sum: 1 },
      pages: { $addToSet: '$page' },
      devices: { $addToSet: '$deviceType' }
    }
  },
  {
    $project: {
      _id: 0,
      sessionId: '$_id',
      duration: { $divide: [{ $subtract: ['$lastAccess', '$firstAccess'] }, 1000] }, // seconds
      pageViews: '$pageViews',
      uniquePages: { $size: '$pages' },
      deviceTypes: { $size: '$devices' },
      sessionDate: { $dateToString: { format: '%Y-%m-%d', date: '$firstAccess' } }
    }
  },
  { $match: { duration: { $gt: 0 } } },
  { $sort: { duration: -1 } },
  { $limit: 100 }
])
```

### 5. Device & OS Analysis

```javascript
// Mobile vs Desktop for incognito users
db.useraccesslogs.aggregate([
  { $match: { isIncognito: true } },
  {
    $group: {
      _id: {
        device: '$deviceType',
        os: '$osName'
      },
      count: { $sum: 1 },
      percentage: { $avg: 1 }
    }
  },
  {
    $group: {
      _id: '$_id.device',
      systems: {
        $push: {
          os: '$_id.os',
          count: '$count'
        }
      },
      totalCount: { $sum: '$count' }
    }
  },
  {
    $project: {
      device: '$_id',
      systems: 1,
      totalCount: 1,
      percentage: { $round: [{ $multiply: [{ $divide: ['$totalCount', 12847] }, 100] }, 2] }
    }
  }
])
```

### 6. Conversion Funnel (Incognito → Registered)

```javascript
// Sessions that later converted to registered users
db.useraccesslogs.aggregate([
  { $match: { isIncognito: true } },
  {
    $group: {
      _id: '$incognitoId',
      ip: { $first: '$ip' },
      country: { $first: '$country' },
      firstAccess: { $min: '$timestamp' },
      lastAccess: { $max: '$timestamp' }
    }
  },
  {
    $lookup: {
      from: 'useraccesslogs',
      let: { incogId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$incognitoId', '$$incogId'] },
            isIncognito: false  // Later authenticated
          }
        }
      ],
      as: 'convertedAccess'
    }
  },
  {
    $project: {
      sessionId: '$_id',
      country: '$country',
      firstAccess: '$firstAccess',
      converted: { $cond: [{ $gt: [{ $size: '$convertedAccess' }, 0] }, 'Yes', 'No'] },
      conversionGap: {
        $cond: [
          { $gt: [{ $size: '$convertedAccess' }, 0] },
          { $divide: [{ $subtract: [{ $arrayElemAt: ['$convertedAccess.timestamp', 0] }, '$lastAccess'] }, 1000 / 60] }, // minutes
          null
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      totalSessions: { $sum: 1 },
      convertedSessions: { $sum: { $cond: [{ $eq: ['$converted', 'Yes'] }, 1, 0] } },
      conversionRate: { $avg: { $cond: [{ $eq: ['$converted', 'Yes'] }, 100, 0] } }
    }
  },
  {
    $project: {
      totalIncognitoSessions: '$totalSessions',
      conversions: '$convertedSessions',
      conversionRate: { $round: ['$conversionRate', 2] }
    }
  }
])

// Result: { totalIncognitoSessions: 1543, conversions: 287, conversionRate: 18.6 }
```

### 7. Real-time Activity (Last 24 Hours)

```javascript
db.useraccesslogs.aggregate([
  {
    $match: {
      timestamp: {
        $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: '%H:00',
          date: '$timestamp'
        }
      },
      total: { $sum: 1 },
      incognito: { $sum: { $cond: ['$isIncognito', 1, 0] } },
      authenticated: { $sum: { $cond: ['$isIncognito', 0, 1] } }
    }
  },
  { $sort: { _id: 1 } }
])

// Hourly breakdown of traffic
```

### 8. User Export Data Format

```javascript
// See what the export generates for a user
db.users.findOne({ _id: ObjectId('...') }).then(user => {
  const userDetails = {
    userId: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || 'N/A',
    isPremium: user.isPremium ? 'Yes' : 'No',
    joinDate: new Date(user.createdAt).toLocaleDateString(),
    
    // Each user-course row
    courses: [
      {
        courseId: ObjectId('...'),
        courseName: 'JavaScript Mastery',
        category: 'Programming',
        highestScore: 850,
        highestPercentage: 85,
        totalAttempts: 12,
        lastAttempted: new Date()
      }
    ]
  };
  return userDetails;
})

// Export CSV (one row per course per user):
// User ID | Name | Email | Mobile | Premium | Join Date | Total Courses | Course Name | Category | ...
```

---

## Application Level Insights (Node.js)

```javascript
// In your analytics service file

// 1. Get traffic summary
async function getTrafficSummary() {
  const stats = await UserAccessLog.aggregate([
    {
      $facet: {
        "total": [{ $count: "count" }],
        "incognito": [{ $match: { isIncognito: true } }, { $count: "count" }],
        "authenticated": [{ $match: { isIncognito: false } }, { $count: "count" }],
        "topCountries": [
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ],
        "topPages": [
          { $group: { _id: "$page", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]
      }
    }
  ]);
  return stats[0];
}

// 2. Get session analytics
async function getSessionAnalytics() {
  return await UserAccessLog.aggregate([
    { $match: { isIncognito: true } },
    {
      $group: {
        _id: "$incognitoId",
        sessionLength: { $max: { $subtract: [{ $max: "$timestamp" }, { $min: "$timestamp" }] } },
        pages: { $push: "$page" },
        country: { $first: "$country" }
      }
    },
    {
      $project: {
        _id: 0,
        sessionId: "$_id",
        durationSeconds: { $divide: ["$sessionLength", 1000] },
        pageCount: { $size: "$pages" },
        country: "$country"
      }
    }
  ]);
}

// 3. Export user with complete details
async function exportUserDetailsFunction(userIds) {
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name email mobile isPremium createdAt');

  const detailedUsers = await Promise.all(
    users.map(async (user) => {
      const progress = await UserTestProgress.find({ userId: user._id })
        .populate('courseId', 'title category');

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || 'N/A',
        isPremium: user.isPremium ? 'Yes' : 'No',
        joinDate: new Date(user.createdAt).toLocaleDateString(),
        courses: progress.map(p => ({
          courseName: p.courseId?.title,
          category: p.courseId?.category,
          highestScore: p.highestScore,
          highestPercentage: p.highestPercentage,
          totalAttempts: p.totalAttempts,
          lastAttempted: p.lastAttemptedAt
        }))
      };
    })
  );

  return generateCSV(detailedUsers);
}
```

---

## Reporting Dashboard Metrics

```javascript
// Key metrics to display

const dashboardMetrics = {
  lastUpdate: new Date(),
  
  traffic: {
    totalVisits: 18081,
    totalIncognito: 12847,
    totalAuthenticated: 5234,
    incognitoPercentage: 71,
    authenticatedPercentage: 29
  },
  
  conversion: {
    incognitoSessions: 1543,
    conversions: 287,
    conversionRate: 18.6,
    averageTimeToConvert: '3.5 days'
  },
  
  geography: {
    topCountries: ['US', 'IN', 'GB', 'CA', 'AU'],
    topCountryCounts: [3245, 2876, 1234, 987, 654]
  },
  
  devices: {
    mobile: 45,
    desktop: 50,
    tablet: 5
  },
  
  topPages: {
    incognito: [
      { page: '/courses', views: 3456 },
      { page: '/about', views: 2345 },
      { page: '/faq', views: 1876 }
    ],
    authenticated: [
      { page: '/api/user/profile', views: 876 },
      { page: '/dashboard', views:654 },
      { page: '/courses/:id', views: 543 }
    ]
  }
};
```

---

