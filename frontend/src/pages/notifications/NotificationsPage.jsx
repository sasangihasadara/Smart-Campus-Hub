import { Bell, CheckCheck, RotateCcw, Trash2 } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const NotificationsPage = () => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        resetNotifications,
    } = useNotifications();

    return (
        <section className="resource-page">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="resource-page__title">Notifications</div>
                    <div className="resource-page__sub">
                        Track campus alerts, booking updates, resource changes, and maintenance activity.
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={markAllAsRead} className="resource-btn resource-btn--primary">
                        <CheckCheck size={16} />
                        Mark all read
                    </button>
                    <button type="button" onClick={resetNotifications} className="resource-btn resource-btn--ghost">
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>

            <div className="resource-stats-grid">
                <div className="resource-stat-card">
                    <div className="resource-stat-card__label">Total alerts</div>
                    <div className="resource-stat-card__value blue">{notifications.length}</div>
                </div>
                <div className="resource-stat-card">
                    <div className="resource-stat-card__label">Unread</div>
                    <div className="resource-stat-card__value orange">{unreadCount}</div>
                </div>
                <div className="resource-stat-card">
                    <div className="resource-stat-card__label">Read</div>
                    <div className="resource-stat-card__value green">{notifications.length - unreadCount}</div>
                </div>
                <div className="resource-stat-card">
                    <div className="resource-stat-card__label">Channels</div>
                    <div className="resource-stat-card__value blue">{new Set(notifications.map((item) => item.category)).size}</div>
                </div>
            </div>

            <div className="resource-table-wrap">
                {notifications.length === 0 ? (
                    <div className="resource-empty">
                        <Bell size={34} className="mx-auto mb-3 text-blue-500" />
                        <div className="resource-empty__title">No notifications</div>
                        <div className="resource-empty__sub">You are all caught up.</div>
                    </div>
                ) : (
                    <div className="divide-y divide-blue-50">
                        {notifications.map((notification) => (
                            <article
                                key={notification.id}
                                className={`flex flex-col gap-4 p-5 transition hover:bg-blue-50/50 md:flex-row md:items-center md:justify-between ${
                                    notification.read ? "bg-white/60" : "bg-white"
                                }`}
                            >
                                <div className="flex gap-4">
                                    <span
                                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: notification.tone }}
                                    />
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className={`text-base font-bold ${notification.read ? "text-slate-600" : "text-slate-900"}`}>
                                                {notification.title}
                                            </h2>
                                            {!notification.read && (
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                                                    New
                                                </span>
                                            )}
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                {notification.category}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                                        <p className="mt-2 text-xs font-semibold text-slate-400">{notification.time}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 md:justify-end">
                                    {!notification.read && (
                                        <button
                                            type="button"
                                            onClick={() => markAsRead(notification.id)}
                                            className="resource-btn resource-btn--ghost"
                                        >
                                            <CheckCheck size={15} />
                                            Read
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeNotification(notification.id)}
                                        className="resource-btn resource-btn--ghost text-red-600"
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default NotificationsPage;
