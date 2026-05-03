import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "../achievementsConfig.js";
import api from "../api/api";
import "../styles/AchievementsPage.css";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.get("/achievements")
      .then((res) => setAchievements(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="achievements-page">
      <h2 className="achievements-header">Achievements</h2>

      <div className="achievements-list">
        {achievements.map((achievement) => {
          const config = ACHIEVEMENTS[achievement];

          return (
            <div
              key={achievement}
              className="achievement-card"
            >
              <div className="achievement-title">
                {config?.title ?? achievement}
              </div>

              <div className="achievement-desc">
                {config?.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}