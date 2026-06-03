import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Trash2, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { deleteCurrentUser, updateCurrentUser } from "../../services/authService";

const ProfilePage = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        picture: "",
        mobileNumber: "",
        address: "",
        faculty: "",
        campusYear: "",
        semester: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
                confirmPassword: "",
                picture: user.picture || "",
                mobileNumber: user.mobileNumber || "",
                address: user.address || "",
                faculty: user.faculty || "",
                campusYear: user.campusYear || "",
                semester: user.semester || "",
            });
        }
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData((current) => ({ ...current, picture: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        if (!formData.name.trim()) {
            return "Name is required.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            return "Enter a valid email address.";
        }
        if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber.trim())) {
            return "Mobile number must be exactly 10 digits.";
        }
        if (!formData.mobileNumber.trim()) {
            return "Mobile number is required.";
        }
        if (!formData.faculty.trim()) {
            return "Faculty is required.";
        }
        if (!formData.campusYear.trim()) {
            return "Campus year is required.";
        }
        if (!formData.semester.trim()) {
            return "Semester is required.";
        }
        if (!formData.address.trim()) {
            return "Address is required.";
        }
        if (formData.password || formData.confirmPassword) {
            if (formData.password.length < 6) {
                return "New password must be at least 6 characters.";
            }
            if (formData.password !== formData.confirmPassword) {
                return "Passwords do not match.";
            }
        }
        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setIsSaving(true);

        try {
            const { confirmPassword, ...payload } = formData;
            const authData = await updateCurrentUser({
                ...payload,
                email: payload.email.trim(),
                mobileNumber: payload.mobileNumber.trim(),
                address: payload.address.trim(),
                faculty: payload.faculty.trim(),
                campusYear: payload.campusYear.trim(),
                semester: payload.semester.trim(),
            });
            login(authData);
            setFormData((current) => ({ ...current, password: "", confirmPassword: "" }));
            setMessage("Profile updated successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Profile update failed.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Delete your profile permanently?");
        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");
        setIsDeleting(true);

        try {
            await deleteCurrentUser();
            logout();
            navigate("/register");
        } catch (err) {
            setError(err.response?.data?.message || "Profile delete failed.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="resource-page">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="mt-2 text-gray-600">Manage your account details and profile photo.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="flex flex-col items-center gap-4 md:w-56">
                            <div className="h-36 w-36 overflow-hidden rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                {formData.picture ? (
                                    <img src={formData.picture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <Camera size={42} />
                                )}
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                <Camera size={16} />
                                Add photo
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>

                        <div className="flex-1 space-y-5">
                            {message && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-5 md:grid-cols-2">
                                <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                                <Input label="Mobile number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="0771234567" inputMode="numeric" pattern="\\d{10}" maxLength={10} required />
                                <Input label="New password" name="password" type="password" minLength={6} value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
                                <Input label="Confirm new password" name="confirmPassword" type="password" minLength={6} value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat new password" />
                                <Input label="Faculty" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="Faculty of Computing" required />
                                <Input label="Campus year" name="campusYear" value={formData.campusYear} onChange={handleChange} placeholder="Year 2" required />
                                <Input label="Semester" name="semester" value={formData.semester} onChange={handleChange} placeholder="Semester 1" required />
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Address</label>
                                    <textarea
                                        name="address"
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Home or hostel address"
                                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    <Save size={17} />
                                    {isSaving ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                >
                                    <Trash2 size={17} />
                                    {isDeleting ? "Deleting..." : "Delete profile"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
        </section>
    );
};

const Input = ({ label, ...props }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
        <input
            {...props}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
    </div>
);

export default ProfilePage;
