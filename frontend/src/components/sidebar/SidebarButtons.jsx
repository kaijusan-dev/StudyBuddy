import { useAuth } from "../../context/AuthContext";
import styles from "./SidebarButtons.module.css";
import { Link } from "react-router-dom";

const buttons = [
  { key: "achievements", label: "Достижения", icon: "/assets/sidebar/achievements-icon.png" },
  { key: "leaderboard", label: "Leaderboard", icon: "/assets/sidebar/leaderboard-icon.png" },
];

export default function SidebarButtons({ onClick }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.stack}>

        {/* <Link to="/play">
          <button
            className={styles.scrollButton}
          >
            <img src="/assets/sidebar/achievements-icon.png" alt="Игры" />
            <span className={styles.label}>
              Игры
            </span>
          </button>
        </Link> */}

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