import { useAuth } from "../../context/AuthContext";
import Button from "../buttons/Button";
import styles from './SidebarButtons.module.css';

export default function SidebarButtons({ onClick }) {
    const {logout} = useAuth();
    return (
        <div className={styles['sidebar-buttons']}>
            <Button onClick={() => onClick("profile")} variant="sidebar">Профиль</Button>
            <Button onClick={() => onClick("achievements")} variant="sidebar">Достижения</Button>
            <Button onClick={() => onClick("leaderboard")} variant="sidebar">Leaderboard</Button>
            <Button onClick={logout} variant="sidebar">Выйти</Button>
        </div>
    )
}