const API_URL = 'https://prep-plus.onrender.com/api';

// ─── JWT helper (no library needed) ─────────────────────────────────────────
// Decodes the expiry claim from the middle (payload) segment of a JWT.
// Returns expiry as milliseconds since epoch, or 0 on failure.
const getJwtExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
};

const api = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Transform backend data to match frontend expectations
            if (data.data && data.data.user) {
                const user = {
                    ...data.data.user,
                    avatar: data.data.user.photoUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                    id: data.data.user._id,
                };
                // Store tokens + user object for session persistence
                if (data.data.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);
                    localStorage.setItem('user', JSON.stringify(user));
                }
                return user;
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMsg = data.errors.map(e => e.msg).join(', ');
                    throw new Error(errorMsg || data.message || 'Registration failed');
                }
                throw new Error(data.message || 'Registration failed');
            }

            // Transform backend data
            if (data.user) {
                const user = {
                    ...data.user,
                    avatar: data.user.photoUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                    id: data.user._id,
                };
                return user;
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // ─── Session restore ────────────────────────────────────────────────────
    // Returns the stored user object if the refresh token is still valid,
    // otherwise clears stale storage and returns null.
    getStoredAuth: () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const userStr = localStorage.getItem('user');

            if (!refreshToken || !userStr) return null;

            // Use the refresh-token expiry (7 days) as the persistence window.
            // The access token (15 min) will be re-issued by the backend on the
            // next authenticated request; the client just needs the user object.
            const refreshExpiry = getJwtExpiry(refreshToken);
            if (refreshExpiry === 0 || Date.now() >= refreshExpiry) {
                // Token expired — wipe everything
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                return null;
            }

            const user = JSON.parse(userStr);
            return { user, accessToken, refreshToken };
        } catch {
            return null;
        }
    },

    getCategories: async () => {
        try {
            const response = await fetch(`${API_URL}/categories`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
            return data.data;
        } catch (error) {
            throw error;
        }
    },

    getCourses: async () => {
        try {
            const response = await fetch(`${API_URL}/courses`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch courses');
            return data.data;
        } catch (error) {
            throw error;
        }
    },

    getQuestions: async (courseId) => {
        try {
            const response = await fetch(`${API_URL}/questions?courseId=${courseId}`, {
                cache: 'no-store', // Always fetch fresh — prevents 304 returning a stale/empty cached body
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch questions');
            return data.data; // Assuming backend returns { success: true, data: [...] } or { success: true, ...paging, data: [...] }
        } catch (error) {
            throw error;
        }
    },

    submitTestProgress: async ({ userId, courseId, questionIds, score, totalMarks }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ userId, courseId, questionIds, score, totalMarks }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save test progress');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getUserTestProgress: async (userId, courseId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/progress?userId=${userId}&courseId=${courseId}`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch test progress');
            return data.data;
        } catch (error) {
            throw error;
        }
    },

    getUserAllProgress: async (userId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/progress/all?userId=${userId}`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch all progress');
            return data.data; // [{ courseId, courseName, highestPercentage, totalAttempts, ... }]
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await fetch(`${API_URL}/auth/forget-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        } catch (error) {
            throw error;
        }
    },

    sendOtp: async (email) => {
        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
            return data;
        } catch (error) {
            throw error;
        }
    },

    verifyOtp: async (email, otp) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'OTP verification failed');
            return data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (token, email, newPassword, confirmPassword) => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        } catch (error) {
            throw error;
        }
    },
};

export default api;

