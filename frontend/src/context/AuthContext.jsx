import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/profile');
            setUser(res.data);
        } 
        catch(err) {

            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
            }
            console.error("Auth check failed:", err);
            
        } finally {
            setLoading(false);
        }
    }

    function login(userData, token) {
        localStorage.setItem('token', token);
        setUser(userData);
    }

    function logout() {
        localStorage.removeItem('token');
        setUser(null);
    }

    useEffect(() => {
        const handleUnauthorized = () => {
        logout();
        navigate("/auth/login");
        };

        window.addEventListener("unauthorized", handleUnauthorized);

        return () => {
        window.removeEventListener("unauthorized", handleUnauthorized);
        };
    }, [navigate]);

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )
};

export function useAuth() {
  return useContext(AuthContext);
}
