import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const RoleLoginPage = ({
    title,
    description,
    emailPlaceholder,
    passwordPlaceholder,
    submitLabel,
    loginRequest,
    onSuccess,
    footer,
    googleClientId,
    googleLoginRequest,
}) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const googleButtonRef = useRef(null);
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    const validate = () => {
        const normalizedEmail = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return "Enter a valid email address.";
        }
        if (!password.trim()) {
            return "Password is required.";
        }
        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }
        return "";
    };

    useEffect(() => {
        if (!googleClientId || !googleLoginRequest || typeof window === "undefined") {
            return undefined;
        }

        let cancelled = false;

        const initializeGoogleButton = () => {
            if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
                return;
            }

            googleButtonRef.current.innerHTML = "";
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async (response) => {
                    if (!response?.credential) {
                        setError("Google sign-in did not return a valid credential.");
                        return;
                    }

                    setError("");
                    setIsSubmitting(true);

                    try {
                        const authData = await googleLoginRequest(response.credential);
                        login(authData);
                        onSuccessRef.current?.(authData);
                    } catch (err) {
                        setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
                    } finally {
                        setIsSubmitting(false);
                    }
                },
            });

            window.google.accounts.id.renderButton(googleButtonRef.current, {
                theme: "outline",
                size: "large",
                shape: "pill",
                text: "continue_with",
                width: 360,
                logo_alignment: "left",
            });
        };

        const existingScript = document.getElementById("google-identity-script");
        if (window.google?.accounts?.id) {
            initializeGoogleButton();
            return () => {
                cancelled = true;
            };
        }

        const script = existingScript || document.createElement("script");
        if (!existingScript) {
            script.id = "google-identity-script";
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        script.addEventListener("load", initializeGoogleButton);

        return () => {
            cancelled = true;
            script.removeEventListener("load", initializeGoogleButton);
        };
    }, [googleClientId, googleLoginRequest, login]);

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
            const authData = await loginRequest({ email: email.trim(), password });
            login(authData);
            onSuccess?.(authData);
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Check your email and password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8">
            <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative flex flex-col justify-between bg-slate-950 p-8 text-white md:p-10">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#38bdf8,transparent_30%),radial-gradient(circle_at_80%_70%,#22c55e,transparent_25%)]" />
                    <div className="relative">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100">
                            <Building2 size={18} />
                            SmartCampus
                        </Link>
                        <div className="mt-16 max-w-xl">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100">
                                <Sparkles size={14} />
                                Campus access portal
                            </div>
                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
                            <p className="mt-5 text-base leading-7 text-slate-300">{description}</p>
                        </div>
                    </div>
                    <div className="relative mt-12 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
                        {["Fast booking", "Role based", "Secure JWT"].map((item) => (
                            <div key={item} className="rounded-lg border border-white/10 bg-white/10 p-4">
                                <ShieldCheck size={18} className="mb-2 text-sky-300" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                            <p className="mt-2 text-sm text-gray-500">Enter your credentials to continue.</p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder={emailPlaceholder}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder={passwordPlaceholder}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                                {isSubmitting ? "Signing in..." : submitLabel}
                                <ArrowRight size={17} />
                            </button>
                        </form>

                        {googleClientId && googleLoginRequest && (
                            <div className="mt-7">
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                                        or continue with Google
                                    </span>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>

                                <div className="mt-4 flex justify-center">
                                    <div ref={googleButtonRef} className="min-h-[48px]" />
                                </div>

                                <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                                    <Sparkles size={14} />
                                    Use your verified Google account for the user portal.
                                </p>
                            </div>
                        )}

                        {footer}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default RoleLoginPage;
