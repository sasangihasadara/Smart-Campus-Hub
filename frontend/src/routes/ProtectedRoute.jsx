import { useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";

export const ProtectedRoute = ({ children, role, allowedRoles, fallback = "/login" }) => {
    const { user, loading } = useAuth();
    const { addToast } = useToast();
    const roles = useMemo(() => allowedRoles || (role ? [role] : null), [allowedRoles, role]);

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
        return <Navigate to={fallback} replace />;
    }

    return children;
};
