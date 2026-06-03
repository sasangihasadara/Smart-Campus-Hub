import {
  BarChart3,
  CalendarCheck2,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  School,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPendingBookings } from "../../services/bookingService";
import { getRoleSidebarSections } from "./navigationConfig";

const iconByKey = {
  dashboard: LayoutDashboard,
  resources: School,
  available: CalendarCheck2,
  reports: BarChart3,
  admin: ClipboardCheck,
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const sections = getRoleSidebarSections(user?.role, location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const checkBookings = async () => {
      try {
        if (user?.role === "ADMIN") {
          const pendingBookings = await getPendingBookings();
          setPendingCount(pendingBookings.length);
        }
      } catch {
        setPendingCount(0);
      }
    };

    checkBookings();
  }, [location.pathname, user?.role]);

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

        {sections.map((section) => (
          <div key={section.label} className={section.label === "Administration" ? "mt-6" : ""}>
            <div className="resource-sidebar__section-label">{section.label}</div>
            <nav className="resource-sidebar__nav">
              {section.items.map((item) => {
                const Icon = iconByKey[item.key];
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
                    {item.key === "admin" && pendingCount > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
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
