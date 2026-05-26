import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "./achievementsConfig.js";
import api from "../../api/api.js";
import styles from "./Achievements.module.css";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api
      .get("/achievements")
      .then((res) => setAchievements(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.achievements}>
      <h2 className={styles.header}>Achievements</h2>

      <div className={styles.list}>
        {achievements.map((achievement) => {
          const config = ACHIEVEMENTS[achievement];

          return (
            <div
              key={achievement}
              className={styles.card}
            >
              <div className={styles.title}>
                {config?.title ?? achievement}
              </div>

              <div className={styles.description}>
                {config?.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}