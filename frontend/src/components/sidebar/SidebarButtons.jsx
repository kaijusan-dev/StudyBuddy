import { useAuth } from "../../context/AuthContext";
import styles from "./SidebarButtons.module.css";

const buttons = [
  { key: "achievements", label: "Достижения", icon: "/assets/sidebar/achievements-icon.png" },
  { key: "leaderboard", label: "Leaderboard", icon: "/assets/sidebar/leaderboard-icon.png" },
];

export default function SidebarButtons({ onClick }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.stack}>
        {buttons.map((btn) => (
          <button
            key={btn.key}
            className={styles.scrollButton}
            onClick={() => onClick(btn.key)}
          >
            <img src={btn.icon} alt={btn.label} />
            <span className={styles.label}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}