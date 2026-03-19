import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import styles from './Layout.module.css';

export default function Layout() {
    const {loading} = useContext(AuthContext);
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