import api from "./api";

const unwrapData = (response) => response.data?.data ?? response.data;

export const getMyNotifications = async () => {
    const response = await api.get("/notifications/my");
    return unwrapData(response);
};

export const markNotificationRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return unwrapData(response);
};

export const markAllNotificationsRead = async () => {
    const response = await api.put("/notifications/read-all");
    return unwrapData(response);
};

export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return unwrapData(response);
};
