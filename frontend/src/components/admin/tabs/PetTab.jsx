import { usePet } from "../../../context/PetSocketContext";
import styles from "./AdminTabs.module.css";

export default function PetTab() {
  const { pet, updateStat } = usePet();

  if (!pet) return null;

  const stats = ["fullness", "energy", "happiness", "xp", "feed_count", "coins"];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const MAX = {
    fullness: 30,
    energy: 100,
    happiness: 100,
    xp: 1000000,
    feed_count: 1000000,
    coins: 1000000,
  };

  const change = (field, delta) => {
    const current = pet[field] ?? 0;
    const newValue = clamp(current + delta, 0, MAX[field]);

    updateStat(field, newValue);
  };

  const setExact = (field, value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;

    const newValue = clamp(num, 0, MAX[field]);
    updateStat(field, newValue);
  };

  const normalize = (value, max) => {
    if (!max) return 0;
    return (value / max) * 100;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Pet Editor</h3>

      {stats.map((field) => (
        <div key={field} style={{ marginBottom: 16 }} className={styles.card}>
          <strong>
            {field}: {pet[field] ?? 0}
          </strong>

          <div className={styles.statControls}>
            <button onClick={() => change(field, -100)} className={styles.button}>-100</button>
            <button onClick={() => change(field, -10)} className={styles.button}>-10</button>
            <button onClick={() => change(field, -5)} className={styles.button}>-5</button>

            <progress
              className={styles.progress}
              value={normalize(pet[field] ?? 0, MAX[field])}
              max={100}
            />

            <button onClick={() => change(field, 5)} className={styles.button}>+5</button>
            <button onClick={() => change(field, 10)} className={styles.button}>+10</button>
            <button onClick={() => change(field, 100)} className={styles.button}>+100</button>
          </div>
        </div>
      ))}
    </div>
  );
}