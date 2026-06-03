import api from './api';

const API_BASE = '/bookings';

const unwrapData = (response) => response.data?.data ?? response.data;

export const createBooking = async (bookingData) => {
    try {
        const response = await api.post(API_BASE, bookingData);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
};

export const getMyBookings = async () => {
    try {
        const response = await api.get(`${API_BASE}/my`);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch your bookings');
    }
};

export const getMyBookingsByStatus = async (status) => {
    try {
        const url = status 
            ? `${API_BASE}/my/filter?status=${status}`
            : `${API_BASE}/my`;
        const response = await api.get(url);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch your bookings');
    }
};

export const getAllBookings = async (status = null) => {
    try {
        const url = status ? `${API_BASE}?status=${status}` : API_BASE;
        const response = await api.get(url);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch all bookings');
    }
};

export const getPendingBookings = async () => {
    try {
        const response = await api.get(`${API_BASE}/pending`);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending bookings');
    }
};

export const approveBooking = async (id, adminNote = '') => {
    try {
        const response = await api.put(`${API_BASE}/${id}/approve`, { adminNote });
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve booking');
    }
};

export const rejectBooking = async (id, adminNote) => {
    try {
        const response = await api.put(`${API_BASE}/${id}/reject`, { adminNote });
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to reject booking');
    }
};

export const getBookingsByResource = async (resourceId) => {
    try {
        const response = await api.get(`${API_BASE}/resource/${resourceId}`);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch resource bookings');
    }
};

export const cancelBooking = async (id) => {
    try {
        const response = await api.put(`${API_BASE}/${id}/cancel`);
        return unwrapData(response);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
};
