import { Link } from "react-router-dom";
import styles from './Navbar.module.css';
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Navbar({isAuthorized}) {
    const {logout} = useContext(AuthContext);
    return (
        <nav className={styles.Navbar}>
            <Link to={'/'} className={styles.Logo}>
                <img src="/logo.png" alt="logo" />
            </Link>

            <div className={styles.Links}>
                <Link to={'/'}>Главная</Link>
                <Link to={'/auth/register'}>Регистрация</Link>
                <Link to={'/auth/login'}>Вход</Link>
                {isAuthorized && 
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