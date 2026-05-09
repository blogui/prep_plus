const Blog = require('../models/Blog');

// ─── GET /api/blogs — all published posts (public) ───────────────────────────
const getAllBlogsController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const filter = { isPublished: true };
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name')
        .select('-content') // exclude heavy content from list
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Blog.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, message: 'Blogs fetched successfully', data: blogs, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/blogs/admin — all posts including drafts (admin only) ───────────
const getAllBlogsAdminController = async (req, res, next) => {
  try {
    const blogs = await Blog.find({})
      .populate('author', 'name')
      .select('-content')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'All blogs fetched successfully', data: blogs, total: blogs.length });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/blogs/:slug — single post by slug (public) ─────────────────────
const getBlogBySlugController = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).populate('author', 'name');
    if (!blog) {
      const error = new Error('Blog post not found');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: 'Blog fetched successfully', data: blog });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/blogs/admin/:id — single post by ID for editing ────────────────
const getBlogByIdController = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) {
      const error = new Error('Blog post not found');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/blogs — create blog (admin) ───────────────────────────────────
const createBlogController = async (req, res, next) => {
  try {
    const { title, summary, content, coverImage, tags, isPublished } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    // Ensure slug uniqueness by appending timestamp if needed
    let slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 100);
    const existing = await Blog.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const blog = new Blog({
      title,
      slug,
      summary,
      content,
      coverImage,
      tags: tags || [],
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
      author: req.user.id,
    });
    await blog.save();
    res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/blogs/:id — update blog (admin) ────────────────────────────────
const updateBlogController = async (req, res, next) => {
  try {
    const { title, summary, content, coverImage, tags, isPublished } = req.body;
    const existing = await Blog.findById(req.params.id);
    if (!existing) {
      const error = new Error('Blog post not found');
      error.status = 404;
      return next(error);
    }
    // Set publishedAt only when transitioning to published for the first time
    if (isPublished && !existing.isPublished && !existing.publishedAt) {
      req.body.publishedAt = new Date();
    }
    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, summary, content, coverImage, tags, isPublished, publishedAt: req.body.publishedAt },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Blog updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/blogs/:id — delete blog (admin) ─────────────────────────────
const deleteBlogController = async (req, res, next) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error('Blog post not found');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogsController,
  getAllBlogsAdminController,
  getBlogBySlugController,
  getBlogByIdController,
  createBlogController,
  updateBlogController,
  deleteBlogController,
};
