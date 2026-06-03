import { Link, useNavigate } from "react-router-dom";
import RoleLoginPage from "./RoleLoginPage";
import { loginPortalUser, loginWithGoogleToken } from "../../services/authService";

const LoginPage = () => {
    const navigate = useNavigate();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <RoleLoginPage
            title="User login"
            description="Sign in with your student, faculty, or staff account."
            emailPlaceholder="student@campus.com"
            passwordPlaceholder="Your password"
            submitLabel="Sign in as user"
            loginRequest={loginPortalUser}
            onSuccess={() => navigate("/user/dashboard")}
            googleClientId={googleClientId}
            googleLoginRequest={loginWithGoogleToken}
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
