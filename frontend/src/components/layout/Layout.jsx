import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import styles from './Layout.module.css';

export default function Layout() {

    const { loading } = useAuth();

    return (
        <div className={styles.Layout}>
            <Navbar />
            <div className={styles.Content}>
                {loading
                ? <div>Загрузка...</div>
                : <Outlet />
                }    
            </div>
        </div>
    )
}