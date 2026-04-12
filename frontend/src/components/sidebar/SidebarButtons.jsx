import { useAuth } from "../../context/AuthContext";
import { useSchedule } from "../../context/ScheduleContext";
import styles from './SidebarButtons.module.css';

export default function SidebarButtons({ onClick }) {
    const {logout} = useAuth();
    const {schedule} = useSchedule();
    return (
        <div className={styles['sidebar-buttons']}>
            {schedule.length == 0 && <button onClick={() => onClick("schedule")}>Получение расписания</button>}
            <button onClick={() => onClick("profile")}>Профиль</button>
            <button onClick={() => onClick("achievements")}>Достижения</button>
            <button onClick={() => onClick("leaderboard")}>Leaderboard</button>
            <button onClick={logout}>Выйти</button>
        </div>
    )
}