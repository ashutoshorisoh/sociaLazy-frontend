import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getNotifications = async (page = 1, limit = 20) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page,
                limit
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const markNotificationAsRead = async (notificationId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const markAllNotificationsAsRead = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/notifications/read-all`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const notificationService = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
}; 