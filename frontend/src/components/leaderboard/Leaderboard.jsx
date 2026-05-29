import { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { usePet } from "../../context/PetSocketContext";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const { user } = useAuth();
  const { pet } = usePet();
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const res = await api.get("/leaderboard");
      setPlayers(res.data.topPlayers || []);
      setUserRank(res.data.userRank);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  function getRank(rank) {
    if (rank === 1) return <span className={styles.gold}>{rank}</span>;
    if (rank === 2) return <span className={styles.silver}>{rank}</span>;
    if (rank === 3) return <span className={styles.bronze}>{rank}</span>;
    return rank;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          ЗАГРУЗКА...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        ДОСКА ЛИДЕРОВ
      </div>

      <div className={styles.header}>
        <div>РАНГ</div>
        <div>ИГРОК</div>
        <div>XP</div>
        <div>LVL</div>
      </div>

      <div className={styles.scrollArea}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`${styles.row} ${
              player.id === user?.id
                ? styles.currentRow
                : ""
            }`}
          >
            <div className={styles.rank}>
              {getRank(index + 1)}
            </div>

            <div className={styles.name}>
              {player.username}
            </div>

            <div className={styles.rating}>
              {player.xp}
              <span className={styles.star}>★</span>
            </div>

            <div className={styles.level}>
              {player.level}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className={styles.currentUserBar}>
          <div className={styles.currentLabel}>
            ВАША ПОЗИЦИЯ
          </div>

          <div className={styles.currentContent}>
            <div className={styles.currentRank}>
               {getRank(userRank)}
            </div>

            <div className={styles.currentName}>
              {user.username}
            </div>

            <div className={styles.currentRating}>
              {pet.xp}
              <span className={styles.star}>★</span>
            </div>

            <div className={styles.currentLevel}>
              LVL {pet.level}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}