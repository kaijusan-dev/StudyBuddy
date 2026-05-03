import { usePet } from "../../context/PetSocketContext";

export default function PetStatus() {
  const { pet } = usePet();

  if (!pet) return null;

  const MAX = {
    fullness: 30,
    energy: 100,
    happiness: 100,
  };

  const normalize = (value, max) => {
    if (!max) return 0;
    return (value / max) * 100;
  };

  return (
    <div>
      <p>
        Сытость
        <progress
          value={normalize(pet.fullness ?? 0, MAX.fullness)}
          max={100}
        />
      </p>

      <p>
        Энергия
        <progress
          value={normalize(pet.energy ?? 0, MAX.energy)}
          max={100}
        />
      </p>

      <p>
        Счастье
        <progress
          value={normalize(pet.happiness ?? 0, MAX.happiness)}
          max={100}
        />
      </p>
    </div>
  );
}