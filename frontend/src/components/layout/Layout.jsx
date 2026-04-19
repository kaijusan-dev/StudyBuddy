import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import styles from './Layout.module.css';
import AdminPanel from "../admin/AdminPanel";
import AdminButton from "../admin/AdminButton";
import { useAdmin } from "../../context/AdminContext";

export default function Layout() {

    const { loading } = useAuth();

    const { isAdmin, isOpen } = useAdmin();

    return (
        <div className={styles.Layout}>
            <Navbar />
            <div className={styles.Content}>
                {loading
                    ? <div>Загрузка...</div>
                    : <div className='wrapper'>
                        <Outlet />
                      </div>
                }    
            </div>

            {!loading && isAdmin && (
                <>
                    <AdminButton />
                    {isOpen && <AdminPanel />}
                </>
            )}
        </div>
    )
}