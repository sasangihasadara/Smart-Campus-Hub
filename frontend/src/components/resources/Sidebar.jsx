import {
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck2,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  School,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyBookings, getPendingBookings } from "../../services/bookingService";

const roleBase = {
  ADMIN: "/admin",
  TECHNICIAN: "/technician",
  STUDENT: "/user",
  FACULTY: "/user",
  STAFF: "/user",
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const basePath = roleBase[user?.role] || (location.pathname.startsWith("/admin") ? "/admin" : "/user");
  const isUserRole = ["STUDENT", "FACULTY", "STAFF"].includes(user?.role);

  const navItems = [
    { label: "Dashboard", path: `${basePath}/dashboard`, icon: LayoutDashboard, tone: "dashboard" },
    { label: "Resources", path: `${basePath}/resources`, icon: School, tone: "resources" },
    { label: "Available", path: `${basePath}/available`, icon: CalendarCheck2, tone: "available" },
    ...(isUserRole ? [{ label: "My Bookings", path: "/my-bookings", icon: Calendar, tone: "bookings" }] : []),
    { label: "Reports", path: `${basePath}/reports`, icon: BarChart3, tone: "reports" },
    { label: "Notifications", path: "/notifications", icon: Bell, tone: "reports" },
    { label: "Profile", path: "/profile", icon: Settings, tone: "dashboard" },
  ];

  const adminItems = [
    { label: "Booking Management", path: "/admin/bookings", icon: ClipboardCheck, tone: "admin" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const checkBookings = async () => {
      try {
        if (isUserRole) {
          const bookings = await getMyBookings();
          const lastVisit = localStorage.getItem("lastBookingVisit");

          if (lastVisit) {
            const count = bookings.filter(
              (booking) =>
                (booking.status === "APPROVED" || booking.status === "REJECTED") &&
                new Date(booking.updatedAt) > new Date(lastVisit)
            ).length;
            setUnreadCount(count);
          }
        }

        if (user?.role === "ADMIN") {
          const pendingBookings = await getPendingBookings();
          setPendingCount(pendingBookings.length);
        }
      } catch {
        setUnreadCount(0);
      }
    };

    checkBookings();
  }, [isUserRole, location.pathname, user?.role]);

  return (
    <aside className="resource-sidebar">
      <div className="resource-sidebar__top">
        <div className="resource-sidebar__logo">
          <div className="resource-sidebar__logo-icon">SC</div>
          <div>
            <div className="resource-sidebar__logo-title">Smart Campus</div>
            <div className="resource-sidebar__logo-sub">Resource control suite</div>
          </div>
        </div>

        <div className="resource-sidebar__section-label">Workspace</div>
        <nav className="resource-sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                type="button"
                className={`resource-nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className={`resource-nav-item__icon resource-nav-item__icon--${item.tone}`}>
                  <Icon size={16} />
                </span>
                <span>{item.label}</span>
                {item.path === "/my-bookings" && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {user?.role === "ADMIN" && (
          <>
            <div className="resource-sidebar__section-label mt-6">Administration</div>
            <nav className="resource-sidebar__nav">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`resource-nav-item ${isActive ? "active" : ""}`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className={`resource-nav-item__icon resource-nav-item__icon--${item.tone}`}>
                      <Icon size={16} />
                    </span>
                    <span>{item.label}</span>
                    {pendingCount > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </div>

      <div className="resource-sidebar__footer">
        <button type="button" className="resource-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
