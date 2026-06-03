import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, MapPin, Phone, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/authService";

const initialForm = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    address: "",
    faculty: "",
    campusYear: "",
    semester: "",
};

const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const validate = () => {
        const requiredFields = [
            ["name", "Full name"],
            ["email", "Email"],
            ["mobileNumber", "Mobile number"],
            ["password", "Password"],
            ["confirmPassword", "Confirm password"],
            ["faculty", "Faculty"],
            ["campusYear", "Campus year"],
            ["semester", "Semester"],
            ["address", "Address"],
        ];

        for (const [field, label] of requiredFields) {
            if (!formData[field].trim()) {
                return `${label} is required.`;
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            return "Enter a valid email address.";
        }
        if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
            return "Mobile number must be exactly 10 digits.";
        }
        if (formData.password.length < 6) {
            return "Password must be at least 6 characters.";
        }
        if (formData.password !== formData.confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setIsSubmitting(true);

        try {
            const { confirmPassword, ...payload } = formData;
            const authData = await registerUser({
                ...payload,
                email: payload.email.trim(),
                mobileNumber: payload.mobileNumber.trim(),
            });
            login(authData);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8">
            <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="bg-slate-950 p-8 text-white md:p-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100">
                        <GraduationCap size={19} />
                        SmartCampus
                    </Link>
                    <div className="mt-14 max-w-md">
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">Create your campus profile</h1>
                        <p className="mt-5 text-base leading-7 text-slate-300">
                            Register once and keep your academic details ready for bookings, tickets, and notifications.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-3">
                        {[
                            { icon: Phone, text: "Contact details" },
                            { icon: MapPin, text: "Address and campus identity" },
                            { icon: GraduationCap, text: "Faculty, year, and semester" },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
                                <Icon size={18} className="text-sky-300" />
                                {text}
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="p-6 md:p-10">
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-gray-900">Student registration</h2>
                        <p className="mt-2 text-sm text-gray-500">New accounts are created as users.</p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                        <Input label="Full name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@campus.com" required />
                        <Input label="Mobile number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="0771234567" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required />
                        <Input label="Password" name="password" type="password" minLength={6} value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required />
                        <Input label="Confirm password" name="confirmPassword" type="password" minLength={6} value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
                        <Input label="Faculty" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="Faculty of Computing" required />
                        <Input label="Campus year" name="campusYear" value={formData.campusYear} onChange={handleChange} placeholder="Year 2" required />
                        <Input label="Semester" name="semester" value={formData.semester} onChange={handleChange} placeholder="Semester 1" required />
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Home or hostel address"
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            <UserPlus size={17} />
                            {isSubmitting ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already registered?{" "}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

const Input = ({ label, ...props }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
        <input
            {...props}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
    </div>
);

export default RegisterPage;
