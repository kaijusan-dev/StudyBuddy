import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export const AdminContext = createContext(null);

export function AdminProvider({children}) {

    const {user} = useAuth();

    const isAdmin = user?.role === "admin";

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        if (!isAdmin) setIsOpen(false);
    }, [isAdmin]);

    const toggleAdmin = () => {
        if (!isAdmin) return;
        setIsOpen(prev => !prev);
    };

    const openAdmin = () => {
        if (!isAdmin) return;
        setIsOpen(true);
    };

    const closeAdmin = () => setIsOpen(false);

    return (
        <AdminContext.Provider value={{
            isOpen, 
            isAdmin,
            toggleAdmin, 
            openAdmin, 
            closeAdmin,
            activeTab,
            setActiveTab
        }}>
            {children}
        </AdminContext.Provider>
    )
};

export function useAdmin() {
  return useContext(AdminContext);
}
