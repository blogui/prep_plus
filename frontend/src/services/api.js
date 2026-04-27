const API_URL = 'https://prep-plus.onrender.com/api';

// ─── Public routes — no Authorization header needed ──────────────────────────
const PUBLIC_PATHS = [
    '/auth/login',
    '/auth/register',
    '/auth/forget-password',
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/reset-password',
    '/auth/refresh-token',  // refresh endpoint is public by nature
];

// ─── JWT helper ───────────────────────────────────────────────────────────────
const getJwtExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
};

// ─── Token refresh state ──────────────────────────────────────────────────────
// Prevents multiple simultaneous 401s from each triggering their own refresh call.
// While one refresh is in-flight, all other 401'd requests are queued and replayed
// once the new token arrives (or rejected together if refresh fails).
let isRefreshing = false;
let failedQueue = []; // [{ resolve, reject }]

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

// ─── Silent refresh helper ────────────────────────────────────────────────────
const silentRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available.');

    const res = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Token refresh failed.');

    // Store the new tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);

    return data.data.accessToken;
};

// ─── Core interceptor ────────────────────────────────────────────────────────
// All API calls go through this single function.
//   • Auto-attaches Authorization: Bearer <accessToken> for protected routes
//   • On 401 → silently refreshes once, then retries the original request
//   • If refresh also fails → clears storage + fires 'auth:expired'
const request = async (path, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const isPublic = PUBLIC_PATHS.some(p => path.startsWith(p));

    const buildHeaders = (accessToken) => ({
        ...(options.body && !(options.body instanceof FormData)
            ? { 'Content-Type': 'application/json' }
            : {}),
        ...(accessToken && !isPublic ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
    });

    // First attempt
    let response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: buildHeaders(token),
    });

    // ── Handle 401: try silent refresh ────────────────────────────────────────
    if (response.status === 401 && !isPublic) {
        if (isRefreshing) {
            // Another refresh is already in-flight — queue this request
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(newToken => fetch(`${API_URL}${path}`, {
                ...options,
                headers: buildHeaders(newToken),
            }));
        }

        isRefreshing = true;

        try {
            const newToken = await silentRefresh();
            isRefreshing = false;
            processQueue(null, newToken);

            // Retry original request with the fresh token
            response = await fetch(`${API_URL}${path}`, {
                ...options,
                headers: buildHeaders(newToken),
            });
        } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError);

            // Refresh failed — force logout everywhere
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:expired'));
            throw new Error('Session expired. Please log in again.');
        }
    }

    return response;
};

// ─── API methods ─────────────────────────────────────────────────────────────
const api = {
    // ── Auth (public) ──────────────────────────────────────────────────────────
    login: async (email, password) => {
        const response = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        if (data.data?.user) {
            const user = {
                ...data.data.user,
                avatar: data.data.user.photoUrl ||
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                id: data.data.user._id,
            };
            if (data.data.accessToken) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
            }
            return user;
        }
        return data;
    },

    register: async (userData) => {
        const response = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(data.errors.map(e => e.msg).join(', ') || data.message || 'Registration failed');
            }
            throw new Error(data.message || 'Registration failed');
        }
        if (data.user) {
            return {
                ...data.user,
                avatar: data.user.photoUrl ||
                    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                id: data.user._id,
            };
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // ── Session restore ────────────────────────────────────────────────────────
    getStoredAuth: () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const userStr = localStorage.getItem('user');

            if (!refreshToken || !userStr) return null;

            const refreshExpiry = getJwtExpiry(refreshToken);
            if (refreshExpiry === 0 || Date.now() >= refreshExpiry) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                return null;
            }

            return { user: JSON.parse(userStr), accessToken, refreshToken };
        } catch {
            return null;
        }
    },

    // ── Protected routes (token auto-attached + silent refresh on 401) ─────────
    getCategories: async () => {
        const response = await request('/categories');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
        return data.data;
    },

    getCourses: async () => {
        const response = await request('/courses');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch courses');
        return data.data;
    },

    // Protected — valid access token required (silently refreshed if expired)
    getQuestions: async (courseId) => {
        const response = await request(`/questions?courseId=${courseId}`, {
            cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch questions');
        return data.data;
    },

    submitTestProgress: async ({ userId, courseId, questionIds, score, totalMarks }) => {
        const response = await request('/progress', {
            method: 'POST',
            body: JSON.stringify({ userId, courseId, questionIds, score, totalMarks }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to save test progress');
        return data;
    },

    getUserTestProgress: async (userId, courseId) => {
        const response = await request(`/progress?userId=${userId}&courseId=${courseId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch test progress');
        return data.data;
    },

    getUserAllProgress: async (userId) => {
        const response = await request(`/progress/all?userId=${userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch all progress');
        return data.data;
    },

    forgotPassword: async (email) => {
        const response = await request('/auth/forget-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(data.errors.map(e => e.msg).join(', '));
            }
            throw new Error(data.message || 'Failed to send reset email');
        }
        return data;
    },

    sendOtp: async (email) => {
        const response = await request('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
        return data;
    },

    verifyOtp: async (email, otp) => {
        const response = await request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'OTP verification failed');
        return data;
    },

    resetPassword: async (token, email, newPassword, confirmPassword) => {
        const response = await request(`/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({ email, newPassword, confirmPassword }),
        });
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(data.errors.map(e => e.msg).join(', '));
            }
            throw new Error(data.message || 'Failed to reset password');
        }
        return data;
    },

    // ── Contact Support ────────────────────────────────────────────────────────
    contactSupport: async ({ contact, message }) => {
        const response = await request('/support/contact', {
            method: 'POST',
            body: JSON.stringify({ contact, message }),
        });
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(data.errors.map(e => e.msg).join(', '));
            }
            throw new Error(data.message || 'Failed to send support message');
        }
        return data;
    },

    // ── Premium activation (simulated payment) ────────────────────────────────
    activatePremium: async () => {
        const response = await request('/payment/activate-premium', { method: 'PATCH' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to activate premium');
        return data;
    },
};

export default api;
