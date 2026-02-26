const API_URL = 'http://localhost:5000/api';

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
                // Store tokens
                if (data.data.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);
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
    }
};

export default api;

