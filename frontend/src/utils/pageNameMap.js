const pageNameMap = {
  '/': 'Home',
  '/dashboard': 'User Dashboard',
  '/admin': 'Admin Dashboard',
  '/test': 'Tests',
  '/blog': 'Blog',
  '/contact-us': 'Contact Us',
  '/contact-support': 'Support',
  '/payment': 'Payment',
  '/study-material': 'Study Material',
  '/syllabus': 'Syllabus',
  '/help-center': 'Help Center',
  '/privacy-policy': 'Privacy Policy',
  '/terms-of-service': 'Terms of Service',
  '/refund-policy': 'Refund Policy',
  '/cookie-policy': 'Cookie Policy',
  '/report-a-bug': 'Report Bug',
  '/reset-password': 'Reset Password',
};

const getPageName = (route) => {
  if (!route) return 'Unknown';

  // Extract base path (remove query params and hash)
  const basePath = route.split('?')[0].split('#')[0];

  // Exact match first
  if (pageNameMap[basePath]) {
    return pageNameMap[basePath];
  }

  // Pattern matching for dynamic routes
  if (basePath.match(/^\/test\/[a-f0-9]+$/i)) return 'Test Details';
  if (basePath.match(/^\/test\/[a-f0-9]+\/start$/i)) return 'Test Interface';
  if (basePath.match(/^\/test\/[a-f0-9]+\/results$/i)) return 'Test Results';
  if (basePath.match(/^\/blog\/[a-z0-9-]+$/i)) return 'Blog Post';
  if (basePath.match(/^\/api\//)) {
    const parts = basePath.split('/').filter(Boolean);
    if (parts[1] === 'user-access') return 'User Access Logs';
    if (parts[1] === 'courses') return 'Courses API';
    if (parts[1] === 'questions') return 'Questions API';
    if (parts[1] === 'progress') return 'Progress API';
    if (parts[1] === 'blogs') return 'Blogs API';
    if (parts[1] === 'categories') return 'Categories API';
    return 'API';
  }

  return basePath || 'Unknown';
};

export default getPageName;
