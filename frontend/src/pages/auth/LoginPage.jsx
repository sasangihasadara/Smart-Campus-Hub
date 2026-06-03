import { Link, useNavigate } from "react-router-dom";
import RoleLoginPage from "./RoleLoginPage";
import { loginPortalUser } from "../../services/authService";

const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <RoleLoginPage
            title="User login"
            description="Sign in with your student, faculty, or staff account."
            emailPlaceholder="student@campus.com"
            passwordPlaceholder="Your password"
            submitLabel="Sign in as user"
            loginRequest={loginPortalUser}
            onSuccess={() => navigate("/user/dashboard")}
            footer={(
                <p className="mt-6 text-center text-sm text-gray-600">
                    Need an account?{" "}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                        Register
                    </Link>
                </p>
            )}
        />
    );
};

export default LoginPage;
