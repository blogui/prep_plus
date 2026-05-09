import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Tag, BookOpen } from 'lucide-react';
import api from '../services/api';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const data = await api.getBlogBySlug(slug);
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error || 'Blog post not found'}</p>
        <button onClick={() => navigate('/blog')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* ── Cover Image ── */}
      {blog.coverImage && (
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>

        {/* ── Tags ── */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Title ── */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{blog.title}</h1>

        {/* ── Meta ── */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
          {blog.author?.name && (
            <span className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {blog.author.name.charAt(0).toUpperCase()}
              </div>
              {blog.author.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(blog.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {blog.readTime} min read
          </span>
        </div>

        {/* ── Summary ── */}
        {blog.summary && (
          <p className="text-blue-200/80 text-lg leading-relaxed mb-8 font-medium border-l-4 border-blue-500 pl-4 italic">
            {blog.summary}
          </p>
        )}

        {/* ── Rich-text content ── */}
        <div
          className="prose prose-invert prose-blue max-w-none blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* ── Footer ── */}
        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            Prep Plus Blog
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
