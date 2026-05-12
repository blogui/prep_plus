const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  getAllBlogsController,
  getAllBlogsAdminController,
  getBlogBySlugController,
  getBlogByIdController,
  createBlogController,
  updateBlogController,
  deleteBlogController,
} = require('../controller/blogController');

// ─── Admin-only middleware ────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', getAllBlogsController);                       // list published
router.get('/slug/:slug', getBlogBySlugController);          // single post by slug

// ─── Admin routes (auth + admin role required) ────────────────────────────────
router.get('/admin/all', authenticate, adminOnly, getAllBlogsAdminController);        // all incl drafts
router.get('/admin/:id', authenticate, adminOnly, getBlogByIdController);             // single by ID
router.post('/', authenticate, adminOnly, createBlogController);
router.put('/:id', authenticate, adminOnly, updateBlogController);
router.delete('/:id', authenticate, adminOnly, deleteBlogController);

module.exports = router;
