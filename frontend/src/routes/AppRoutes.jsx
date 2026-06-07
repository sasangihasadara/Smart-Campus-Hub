import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import ResourceModuleLayout from "../components/resources/ResourceModuleLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminLoginPage from "../pages/auth/AdminLoginPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import TechnicianLoginPage from "../pages/auth/TechnicianLoginPage";
import BookingListPage from "../pages/bookings/BookingListPage";
import BookingHistoryPage from "../pages/booking/BookingHistoryPage";
import HomePage from "../pages/home/HomePage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import MyBookings from "../pages/booking/MyBookings";
import PublicReportsPage from "../pages/reports/PublicReportsPage";
import AvailableResourcesPage from "../pages/resources/AvailableResourcesPage";
import Dashboard from "../pages/resources/Dashboard";
import Reports from "../pages/resources/Reports";
import ResourceListPage from "../pages/resources/ResourceListPage";
import TechnicianDashboardPage from "../pages/technician/TechnicianDashboardPage";
import TicketListPage from "../pages/tickets/TicketListPage";
import TechnicianTicketPage from "../pages/tickets/TechnicianTicketPage";
import AdminTicketPage from "../pages/tickets/AdminTicketPage";
import UserDashboardPage from "../pages/user/UserDashboardPage";

const USER_ROLES = ["STUDENT", "FACULTY", "STAFF"];
const USER_REPORT_ROLES = ["FACULTY", "STAFF"];
const ALL_ROLES = ["ADMIN", "TECHNICIAN", ...USER_ROLES];
const ADMIN_ROLES = ["ADMIN"];
const TECHNICIAN_ROLES = ["TECHNICIAN"];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user-login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/technician-login" element={<TechnicianLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ResourceModuleLayout />}>
        <Route
          path="/admin/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["ADMIN"]} fallback="/admin-login">
              <AdminDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/resources"
          element={(
            <ProtectedRoute allowedRoles={["ADMIN"]} fallback="/admin-login">
              <ResourceListPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/available"
          element={(
            <ProtectedRoute allowedRoles={["ADMIN"]} fallback="/admin-login">
              <AvailableResourcesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/reports"
          element={(
            <ProtectedRoute allowedRoles={["ADMIN"]} fallback="/admin-login">
              <Reports />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/panel"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/bookings"
          element={(
            <ProtectedRoute allowedRoles={["ADMIN"]} fallback="/admin-login">
              <AdminBookings />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/technician/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["TECHNICIAN"]} fallback="/technician-login">
              <TechnicianDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/technician/resources"
          element={(
            <ProtectedRoute allowedRoles={["TECHNICIAN"]} fallback="/technician-login">
              <ResourceListPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/technician/available"
          element={(
            <ProtectedRoute allowedRoles={["TECHNICIAN"]} fallback="/technician-login">
              <AvailableResourcesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/technician/reports"
          element={(
            <ProtectedRoute allowedRoles={["TECHNICIAN"]} fallback="/technician-login">
              <Reports />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/technician/panel"
          element={<Navigate to="/technician/dashboard" replace />}
        />

        <Route
          path="/user/dashboard"
          element={(
            <ProtectedRoute allowedRoles={USER_ROLES}>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/user/resources"
          element={(
            <ProtectedRoute allowedRoles={USER_ROLES}>
              <ResourceListPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/user/available"
          element={(
            <ProtectedRoute allowedRoles={USER_ROLES}>
              <AvailableResourcesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/user/reports"
          element={(
            <ProtectedRoute allowedRoles={USER_REPORT_ROLES} fallback="/user/dashboard">
              <Reports />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/user/panel"
          element={(
            <ProtectedRoute allowedRoles={USER_ROLES}>
              <UserDashboardPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/my-bookings"
          element={(
            <ProtectedRoute allowedRoles={USER_ROLES}>
              <MyBookings />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/booking-history"
          element={(
            <ProtectedRoute allowedRoles={USER_ROLES}>
              <BookingHistoryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <ProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/notifications"
          element={(
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <NotificationsPage />
            </ProtectedRoute>
          )}
        />

        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/available" element={<AvailableResourcesPage />} />
        <Route path="/available-resources" element={<AvailableResourcesPage />} />
        <Route path="/resource-reports" element={<Reports />} />
      </Route>

      <Route
        path="/bookings"
        element={(
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <BookingListPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/tickets"
        element={(
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <TicketListPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/technician-tickets"
        element={(
          <ProtectedRoute allowedRoles={TECHNICIAN_ROLES} fallback="/technician-login">
            <TechnicianTicketPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin-tickets"
        element={(
          <ProtectedRoute allowedRoles={ADMIN_ROLES} fallback="/admin-login">
            <AdminTicketPage />
          </ProtectedRoute>
        )}
      />
      <Route path="/reports" element={<PublicReportsPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
