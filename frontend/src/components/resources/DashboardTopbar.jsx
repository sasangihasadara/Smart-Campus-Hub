import { useMemo, useState } from "react";
import { Bell, ChevronDown, LogOut, Search, Settings, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { getRoleSearchItems } from "./navigationConfig";

export default function DashboardTopbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const results = useMemo(() => {
    const searchItems = [
      ...getRoleSearchItems(user?.role, location.pathname),
      { label: "Notifications", path: "/notifications" },
      { label: "Profile", path: "/profile" },
    ];
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return searchItems.filter((item) => item.label.toLowerCase().includes(value)).slice(0, 5);
  }, [location.pathname, query, user?.role]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (results[0]) {
      navigate(results[0].path);
      setQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <header className="resource-header">
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Operations Dashboard</div>
        <div className="mt-1 truncate text-xl font-bold text-slate-900">
          {user ? `Welcome back, ${user.name}` : "Smart Campus Control Center"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={submitSearch} className="relative hidden w-80 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dashboard..."
            className="h-11 w-full rounded-xl border border-blue-100 bg-white/80 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
          {results.length > 0 && (
            <div className="absolute right-0 top-12 z-50 w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl">
              {results.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
                >
                  <Search size={15} className="text-blue-500" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setProfileOpen(false);
            }}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white/80 text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            aria-label="Open notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Notifications</div>
                  <div className="text-xs text-slate-500">{unreadCount} unread updates</div>
                </div>
                <button type="button" onClick={markAllAsRead} className="text-xs font-bold text-blue-600">
                  Mark all read
                </button>
              </div>
              {notifications.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markAsRead(item.id)}
                  className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.tone }} />
                  <div>
                    <div className={`text-sm font-semibold ${item.read ? "text-slate-600" : "text-slate-900"}`}>{item.title}</div>
                    <div className="text-xs text-slate-500">{item.message}</div>
                    <div className="text-xs text-slate-500">{item.time}</div>
                  </div>
                </button>
              ))}
              <Link
                to="/notifications"
                onClick={() => setNotificationsOpen(false)}
                className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Open notification center
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((open) => !open);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white/80 px-3 py-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User size={17} />
              )}
            </span>
            <div className="hidden text-left leading-tight md:block">
              <div className="max-w-32 truncate text-sm font-bold text-slate-900">{user?.name || "Guest"}</div>
              <div className="text-xs font-semibold text-slate-500">{user?.role || "Visitor"}</div>
            </div>
            <ChevronDown size={15} className="text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-4">
                <div className="truncate text-sm font-bold text-slate-900">{user?.name || "Guest"}</div>
                <div className="truncate text-xs text-slate-500">{user?.email || "Not signed in"}</div>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
              >
                <Settings size={16} className="text-blue-600" />
                Profile settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
