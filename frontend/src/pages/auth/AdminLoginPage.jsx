import { Link, useNavigate } from "react-router-dom";
import RoleLoginPage from "./RoleLoginPage";
import { loginAdmin } from "../../services/authService";

const AdminLoginPage = () => {
    const navigate = useNavigate();

    return (
        <RoleLoginPage
            title="Admin login"
            description="Only administrator accounts can access this portal."
            emailPlaceholder="admin@PAF.com"
            passwordPlaceholder="Admin123"
            submitLabel="Sign in as admin"
            loginRequest={loginAdmin}
            onSuccess={() => navigate("/admin/dashboard")}
            footer={(
                <p className="mt-6 text-center text-sm text-gray-600">
                    Not an admin?{" "}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                        User login
                    </Link>
                </p>
            )}
        />
    );
};

export default AdminLoginPage;
