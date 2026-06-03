import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import { useEffect } from "react";

export const ProtectedRoute = ({ children, role, allowedRoles, fallback = "/login" }) => {
    const { user, loading } = useAuth();
    const { addToast } = useToast();
    const roles = allowedRoles || (role ? [role] : null);

    useEffect(() => {
        if (user && roles && !roles.includes(user.role)) {
            addToast("Access Denied: You do not have permission to view this page.", "error");
        }
    }, [user, roles, addToast]);

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Loading...</div>;
    }

    if (!user) {
        return <Navigate to={fallback} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};
