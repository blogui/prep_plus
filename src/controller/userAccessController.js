const UserAccessLog = require('../models/UserAccessLog');
const User = require('../models/User');
const UserTestProgress = require('../models/UserTestProgress');
const Course = require('../models/Course');

const buildFilter = (query) => {
  const filter = {};
  const { search, country, pageName } = query;

  if (country) {
    filter.country = country;
  }

  if (pageName) {
    filter.page = { $regex: pageName, $options: 'i' };
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { ip: regex },
      { country: regex },
      { page: regex },
      { userAgent: regex },
      { browserName: regex },
      { osName: regex },
      { deviceType: regex },
      { userName: regex },
      { userEmail: regex },
    ];
  }

  return filter;
};

const getUserAccessLogs = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 5), 100);
    const filter = buildFilter(req.query);

    const total = await UserAccessLog.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const logs = await UserAccessLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const uniqueUsersResult = await UserAccessLog.aggregate([
      { $match: filter },
      { $group: { _id: '$userId' } },
      { $count: 'uniqueUsers' },
    ]);
    const uniqueUsers = uniqueUsersResult[0]?.uniqueUsers || 0;

    const uniquePagesResult = await UserAccessLog.aggregate([
      { $match: filter },
      { $group: { _id: '$page' } },
      { $count: 'uniquePages' },
    ]);
    const uniquePages = uniquePagesResult[0]?.uniquePages || 0;

    const buildTop = async (field) => {
      const results = await UserAccessLog.aggregate([
        { $match: filter },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ]);
      return results.map((item) => ({ name: item.name || 'Unknown', count: item.count }));
    };

    const [topCountries, topPages, topBrowsers, topDevices, topOS] = await Promise.all([
      buildTop('country'),
      buildTop('page'),
      buildTop('browserName'),
      buildTop('deviceType'),
      buildTop('osName'),
    ]);

    let users = [];
    if (req.query.listUsers === 'true') {
      users = await UserAccessLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              userId: '$userId',
              name: '$userName',
              email: '$userEmail',
            },
            pageViews: { $sum: 1 },
            lastSeen: { $max: '$timestamp' },
          },
        },
        { $sort: { pageViews: -1, lastSeen: -1 } },
        {
          $project: {
            _id: 0,
            userId: '$_id.userId',
            name: '$_id.name',
            email: '$_id.email',
            pageViews: 1,
            lastSeen: 1,
          },
        },
      ]);
    }

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { total, page, limit, totalPages },
      analytics: {
        totalLogs: total,
        uniqueUsers,
        uniquePages,
        topCountries,
        topPages,
        topBrowsers,
        topDevices,
        topOS,
      },
      users,
    });
  } catch (err) {
    next(err);
  }
};



/**
 * Export user details with course information
 */
const exportUserDetails = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userIds array',
      });
    }

    const users = await User.find({
      _id: { $in: userIds },
    })
      .select('_id name email mobile isPremium createdAt')
      .lean();

    // Get course progress for each user
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const progress = await UserTestProgress.find({
          userId: user._id,
        })
          .populate('courseId', 'title category')
          .lean();

        const courses = progress.map((p) => ({
          courseId: p.courseId?._id,
          courseName: p.courseId?.title || 'Unknown',
          category: p.courseId?.category || 'Unknown',
          highestScore: p.highestScore,
          highestPercentage: p.highestPercentage,
          totalAttempts: p.totalAttempts,
          lastAttempted: p.lastAttemptedAt,
        }));

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile || 'N/A',
          isPremium: user.isPremium ? 'Yes' : 'No',
          joinDate: new Date(user.createdAt).toLocaleDateString(),
          totalCourses: courses.length,
          courses,
        };
      })
    );

    // Generate CSV
    const headers = [
      'User ID',
      'Name',
      'Email',
      'Mobile',
      'Premium',
      'Join Date',
      'Total Courses',
      'Course Name',
      'Category',
      'Highest Score',
      'Highest Percentage',
      'Attempts',
      'Last Attempted',
    ];

    const rows = [];
    userDetails.forEach((user) => {
      if (user.courses.length === 0) {
        rows.push([
          user.userId,
          user.name,
          user.email,
          user.mobile,
          user.isPremium,
          user.joinDate,
          0,
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
        ]);
      } else {
        user.courses.forEach((course, idx) => {
          rows.push([
            idx === 0 ? user.userId : '',
            idx === 0 ? user.name : '',
            idx === 0 ? user.email : '',
            idx === 0 ? user.mobile : '',
            idx === 0 ? user.isPremium : '',
            idx === 0 ? user.joinDate : '',
            idx === 0 ? user.totalCourses : '',
            course.courseName,
            course.category,
            course.highestScore,
            `${course.highestPercentage}%`,
            course.totalAttempts,
            course.lastAttempted
              ? new Date(course.lastAttempted).toLocaleDateString()
              : 'N/A',
          ]);
        });
      }
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
    res.setHeader(
      'Content-Disposition',
      `attachment;filename="user-details-${Date.now()}.csv"`
    );
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};
module.exports = { getUserAccessLogs, exportUserDetails };