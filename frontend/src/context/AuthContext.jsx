/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const bootstrapAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                window.setTimeout(() => {
                    if (active) {
                        setLoading(false);
                    }
                }, 0);
                return;
            }

            try {
                const currentUser = await getCurrentUser();
                if (active) {
                    setUser(currentUser);
                }
            } catch {
                localStorage.removeItem("token");
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void bootstrapAuth();

        return () => {
            active = false;
        };
    }, []);

    const login = ({ token, user: userData }) => {
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
