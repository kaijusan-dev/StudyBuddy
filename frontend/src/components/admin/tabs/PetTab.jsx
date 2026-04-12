import { usePet } from "../../../context/PetSocketContext";

export default function PetTab() {

    const { pet, updateStat } = usePet();

    const stats = ["fullness", "energy", "happiness"];

    if (!pet) return null;

    const change = (field, delta) => {
        const newValue = Math.max(0, Math.min(100, pet[field] + delta));

        updateStat(field, newValue);
    };

    return (
        <div>
        <h3>Pet Editor</h3>

        {stats.map((field) => (
            <div key={field} style={{ marginBottom: 12 }}>
            <strong>
                {field}: {pet[field]}
            </strong>

            <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => change(field, -100)}>-100</button>
                <button onClick={() => change(field, -10)}>-10</button>

                <progress value={pet[field]} max="100" />

                <button onClick={() => change(field, 10)}>+10</button>
                <button onClick={() => change(field, 100)}>+100</button>
            </div>
            </div>
        ))}
        </div>
    );
}