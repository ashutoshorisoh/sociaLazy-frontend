import axios from 'axios';

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with proper configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const auth = {
    login: (credentials) => {
        console.log('Attempting login with:', { ...credentials, password: '[REDACTED]' });
        return api.post('/auth/login', credentials);
    },
    register: (userData) => {
        console.log('Attempting registration with:', { ...userData, password: '[REDACTED]' });
        return api.post('/auth/register', userData);
    },
    getCurrentUser: () => api.get('/auth/me'),
    getCurrentUserProfile: (page = 1, limit = 10) => api.get(`/auth/me?page=${page}&limit=${limit}`),
};

export const users = {
    getProfile: (userId) => api.get(`/users/profile/${userId}`),
    updateProfile: (data) => api.put('/users/profile', data),
    follow: (userId) => api.post(`/users/follow/${userId}`),
    unfollow: (userId) => api.post(`/users/unfollow/${userId}`),
    search: (query) => api.get(`/users/search/${query}`),
    checkFollowing: async (userId) => {
        return await api.get(`/auth/following/${userId}`);
    },
    deleteAccount: (username) => api.delete(`/users/username/${username}`),
};

export const posts = {
    getAll: () => api.get('/posts'),
    getById: (id) => api.get(`/posts/${id}`),
    create: (content, image) => api.post('/posts', { content, image }),
    update: (id, content, image) => api.put(`/posts/${id}`, { content, image }),
    delete: (id) => api.delete(`/posts/${id}`),
    like: (id) => api.put(`/posts/like/${id}`),
    getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
    addComment: (postId, content) => api.post(`/comments/${postId}`, { content }),
    getPostComments: (postId) => api.get(`/comments/post/${postId}`),
    likeComment: (commentId) => api.put(`/comments/like/${commentId}`),
    getTrendingTopics: () => api.get('/posts/trending-topics'),
    search: (query) => api.get(`/posts/search?query=${encodeURIComponent(query)}`),
    getTrending: async (timeFrame = '24h', limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/posts/trending`, {
                params: { timeFrame, limit },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export const comments = {
    getByPost: (postId) => api.get(`/comments/post/${postId}`),
    create: (postId, data) => api.post(`/comments/${postId}`, data),
    update: (commentId, data) => api.put(`/comments/${commentId}`, data),
    delete: (commentId) => api.delete(`/comments/${commentId}`),
    like: (commentId) => api.put(`/comments/like/${commentId}`),
};

export const notifications = {
    getAll: () => api.get('/notifications'),
    markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

export default api; 