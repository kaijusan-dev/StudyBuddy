import { Link } from "react-router-dom";
import styles from './Navbar.module.css';
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const {user, logout} = useAuth();
    return (
        <nav className={styles.Navbar}>
            <Link to={'/'} className={styles.Logo}>
                <img src="/logo.png" alt="logo" />
            </Link>

            <div className={styles.Links}>
                <Link to={'/'}>Главная</Link>
                {!user && 
                    <>
                        <Link to={'/auth/register'}>Регистрация</Link>
                        <Link to={'/auth/login'}>Вход</Link>
                    </>
                } 
                
                {user && 
                    <>
                        <Link to={'/pet'}>Питомец</Link>
                        <Link to={'/profile'}>Профиль</Link>
                        <Link to={'/'} onClick={logout}>Выйти</Link>
                    </>
                }
            </div>
        </nav>
    )
}