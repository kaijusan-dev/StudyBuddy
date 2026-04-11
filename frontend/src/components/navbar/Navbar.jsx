import { Link } from "react-router-dom";
import styles from './Navbar.module.css';
import { useAuth } from "../../context/AuthContext";
import Avatar from "../avatar/Avatar";

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
                        <Link to={'/pet'}><img src="/pet-icon.png" className={styles.icon} /></Link>
                        <Link to={'/profile'}><Avatar type='small' avatar={user?.avatar}/></Link>
                        <Link to={'/'} onClick={logout}><img src="/logout-icon.png" className={styles.icon} /></Link>
                    </>
                }
            </div>
        </nav>
    )
}