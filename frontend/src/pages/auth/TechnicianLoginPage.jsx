import { Link, useNavigate } from "react-router-dom";
import RoleLoginPage from "./RoleLoginPage";
import { loginTechnician } from "../../services/authService";

const TechnicianLoginPage = () => {
    const navigate = useNavigate();

    return (
        <RoleLoginPage
            title="Technician login"
            description="Only technician accounts can access this portal."
            emailPlaceholder="tech@PAF.com"
            passwordPlaceholder="Tech@123"
            submitLabel="Sign in as technician"
            loginRequest={loginTechnician}
            onSuccess={() => navigate("/technician/dashboard")}
            footer={(
                <p className="mt-6 text-center text-sm text-gray-600">
                    Not a technician?{" "}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                        User login
                    </Link>
                </p>
            )}
        />
    );
};

export default TechnicianLoginPage;
