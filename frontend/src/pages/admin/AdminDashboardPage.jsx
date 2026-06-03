import { Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const detail = (value, fallback = "Not added") => value || fallback;

const AdminDashboardPage = () => {
    const { user } = useAuth();

    return (
        <section className="resource-page">
            <div className="resource-page__title">Admin account</div>
            <div className="resource-page__sub">Your administrator profile and approved admin tools.</div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600">
                            {user?.picture ? (
                                <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <UserRound size={42} />
                            )}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                                <ShieldCheck size={14} />
                                Administrator
                            </div>
                            <h1 className="mt-3 text-2xl font-bold text-slate-900">{detail(user?.name, "Admin")}</h1>
                            <p className="mt-1 text-sm font-semibold text-slate-500">{detail(user?.email)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <AccountItem icon={Mail} label="Email" value={detail(user?.email)} />
                        <AccountItem icon={Phone} label="Mobile" value={detail(user?.mobileNumber)} />
                        <AccountItem icon={MapPin} label="Address" value={detail(user?.address)} wide />
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-bold uppercase tracking-wide text-slate-500">Admin pages</div>
                    <div className="mt-4 space-y-3">
                        <RoleLink to="/admin/resources" label="Resource management" />
                        <RoleLink to="/admin/available" label="Available resources" />
                        <RoleLink to="/admin/bookings" label="Booking management" />
                        <RoleLink to="/admin-tickets" label="Ticket management" />
                        <RoleLink to="/admin/reports" label="Resource reports" />
                        <RoleLink to="/profile" label="My profile" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const AccountItem = ({ icon, label, value, wide = false }) => {
    const Icon = icon;

    return (
        <div className={`rounded-lg border border-slate-100 bg-slate-50 p-4 ${wide ? "md:col-span-2" : ""}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Icon size={14} />
                {label}
            </div>
            <div className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</div>
        </div>
    );
};

const RoleLink = ({ to, label }) => (
    <Link to={to} className="block rounded-lg border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
        {label}
    </Link>
);

export default AdminDashboardPage;
