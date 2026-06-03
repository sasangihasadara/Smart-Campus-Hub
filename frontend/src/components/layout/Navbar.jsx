import React, { useState } from "react";
import { Bell, Calendar, FileBarChart, HardDrive, LayoutDashboard, Menu, Ticket, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NavLink = ({ to, label, isActive }) => (
  <Link
    to={to}
    className={`relative group px-1 py-2 font-semibold text-sm transition-colors duration-300 font-sans ${
      isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
    }`}
  >
    {label}
    <span
      className={`absolute left-0 bottom-0 w-full h-0.5 bg-blue-600 transition-transform duration-300 origin-left ${
        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "TECHNICIAN"
        ? "/technician/dashboard"
        : "/user/dashboard";

  const resourcesPath =
    user?.role === "ADMIN"
      ? "/admin/resources"
      : user?.role === "TECHNICIAN"
        ? "/technician/resources"
        : user
          ? "/user/resources"
          : "/resources";
  const navItems = (() => {
    if (!user) {
      return [
        { label: "Resources", path: "/resources", icon: <HardDrive size={18} /> },
        { label: "Reports", path: "/reports", icon: <FileBarChart size={18} /> },
      ];
    }

    if (user.role === "ADMIN") {
      return [
        { label: "Resources", path: resourcesPath, icon: <HardDrive size={18} /> },
        { label: "Booking Management", path: "/admin/bookings", icon: <Calendar size={18} /> },
        { label: "Ticket Management", path: "/admin-tickets", icon: <Ticket size={18} /> },
        { label: "Reports", path: "/admin/reports", icon: <FileBarChart size={18} /> },
      ];
    }

    if (user.role === "TECHNICIAN") {
      return [
        { label: "Resources", path: resourcesPath, icon: <HardDrive size={18} /> },
        { label: "Tickets", path: "/technician-tickets", icon: <Ticket size={18} /> },
        { label: "Reports", path: "/technician/reports", icon: <FileBarChart size={18} /> },
      ];
    }

    if (["FACULTY", "STAFF"].includes(user.role)) {
      return [
        { label: "Resources", path: resourcesPath, icon: <HardDrive size={18} /> },
        { label: "My Bookings", path: "/my-bookings", icon: <Calendar size={18} /> },
        { label: "Tickets", path: "/tickets", icon: <Ticket size={18} /> },
        { label: "Reports", path: "/reports", icon: <FileBarChart size={18} /> },
      ];
    }

    return [
      { label: "Resources", path: resourcesPath, icon: <HardDrive size={18} /> },
      { label: "My Bookings", path: "/my-bookings", icon: <Calendar size={18} /> },
      { label: "Tickets", path: "/tickets", icon: <Ticket size={18} /> },
    ];
  })();

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full font-sans backdrop-blur-md bg-white/75 border-b border-gray-200/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group transition-transform hover:scale-105">
              <div className="bg-blue-600 p-2 rounded-lg mr-2 shadow-sm">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight font-heading">
                Smart<span className="text-blue-600">Campus</span>
              </span>
            </Link>
            <div className="hidden lg:ml-12 lg:flex lg:space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  label={item.label}
                  isActive={location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path))}
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8 font-heading">
            {user && (
              <Link to={dashboardPath} className="text-gray-600 hover:text-blue-600 font-semibold text-sm transition-colors">
                Dashboard
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link to="/admin/bookings" className="text-gray-600 hover:text-blue-600 font-semibold text-sm transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Admin Bookings
              </Link>
            )}
            <Link to="/my-bookings" className="text-gray-600 hover:text-blue-600 font-semibold text-sm transition-colors">
              My Bookings
            </Link>

            <div className="flex items-center space-x-5 border-l border-gray-100 pl-8">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="text-gray-400 hover:text-blue-600 transition-colors relative"
              >
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-36 top-16 w-64 rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-xl">
                  <p className="font-semibold text-gray-900">Notifications</p>
                  <p className="mt-1">Open the dashboard notification center for full details.</p>
                  <Link to="/notifications" className="mt-3 inline-flex font-semibold text-blue-600 hover:text-blue-700">
                    View notifications
                  </Link>
                </div>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden xl:block text-right">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 leading-tight">{user.role}</p>
                  </div>
                  <Link to="/profile" className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm overflow-hidden transition-transform hover:scale-110">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-sm font-semibold text-gray-600 transition-colors hover:text-blue-600"
                >
                  Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/register" className="text-gray-600 hover:text-blue-600 font-semibold text-sm transition-colors">
                    Register
                  </Link>
                  <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow-md transition-all text-sm">
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-100/50 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-b border-gray-200 animate-fade-in-down">
          <div className="px-4 py-6 space-y-2 flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={closeMobile}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  location.pathname === item.path ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-3 p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-blue-600">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashboardPath} onClick={closeMobile} className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">
                  Dashboard
                </Link>
                {user.role === "ADMIN" && (
                  <Link to="/admin/bookings" onClick={closeMobile} className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">
                    Admin Bookings
                  </Link>
                )}
                <Link to="/profile" onClick={closeMobile} className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                    navigate("/");
                  }}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobile} className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">
                  Log In
                </Link>
                <Link to="/register" onClick={closeMobile} className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
