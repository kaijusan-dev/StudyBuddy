import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        } catch(err) {
            localStorage.removeItem('token');
            setUser(null);
        }
        
        setLoading(false);

    }

    function login(userData, token) {
        localStorage.setItem('token', token);
        setUser(userData);
    }

    function logout() {
        localStorage.removeItem('token');
        setUser(null);
    }

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
}

export {AuthProvider, AuthContext}
