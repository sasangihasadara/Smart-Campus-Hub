import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";

const formatTime = (createdAt) => {
  if (!createdAt) return "Just now";

  const created = new Date(createdAt);
  const diffMs = Date.now() - created.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  return created.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeNotification = (notification) => ({
  ...notification,
  id: String(notification.id),
  time: formatTime(notification.createdAt),
});

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data.map(normalizeNotification));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = async (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === String(id) ? { ...notification, read: true } : notification
      )
    );
    try {
      await markNotificationRead(id);
    } catch {
      loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
    try {
      await markAllNotificationsRead();
    } catch {
      loadNotifications();
    }
  };

  const removeNotification = async (id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== String(id))
    );
    try {
      await deleteNotification(id);
    } catch {
      loadNotifications();
    }
  };

  const resetNotifications = () => {
    loadNotifications();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    resetNotifications,
    refreshNotifications: loadNotifications,
  };
};
