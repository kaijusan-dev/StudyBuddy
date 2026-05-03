import { usePet } from "../../../context/PetSocketContext";

export default function PetTab() {
  const { pet, updateStat } = usePet();

  if (!pet) return null;

  const stats = ["fullness", "energy", "happiness", "xp", "feed_count"];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const MAX = {
    fullness: 30,
    energy: 100,
    happiness: 100,
    xp: 1000000,
    feed_count: 1000000,
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
    <div>
      <h3>Pet Editor</h3>

      {stats.map((field) => (
        <div key={field} style={{ marginBottom: 16 }}>
          <strong>
            {field}: {Math.round(pet[field] ?? 0)}
          </strong>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => change(field, -100)}>-100</button>
            <button onClick={() => change(field, -10)}>-10</button>
            <button onClick={() => change(field, -5)}>-5</button>

            <progress
              value={normalize(pet[field] ?? 0, MAX[field])}
              max={100}
            />

            <button onClick={() => change(field, 5)}>+5</button>
            <button onClick={() => change(field, 10)}>+10</button>
            <button onClick={() => change(field, 100)}>+100</button>
          </div>
        </div>
      ))}
    </div>
  );
}