import { usePet } from "../../context/PetSocketContext";
import StatBar from "./bar/StatBar";
import './Pet.css';

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

  const format = (value) => Math.round(value * 10) / 10;

  return (
    <div className="pet-status">
      <h3 className="title">Состояние</h3>

      {/* Горизонтальная панель с монетами, опытом и уровнем */}
      <div className="top-stats">
        <div className="top-stat">
          <img src="/assets/level-icon.png" alt="Уровень" />
          <span>Уровень {pet.level ?? 1}</span>
        </div>
        <div className="top-stat">
          <img src="/assets/xp-icon.png" alt="Опыт" />
          <span>Опыт {pet.xp ?? 0}</span>
        </div>
        <div className="top-stat">
          <img src="/assets/coin-icon.png" alt="Монеты" />
          <span>Монеты {pet.coins ?? 0}</span>
        </div>
      </div>
      {/* Характеристики с полосками (вертикально) */}
      <div className="stat">
        <img src="/assets/bar/food-icon.png" alt="Еда" />
        <StatBar
          value={normalize(pet.fullness ?? 0, MAX.fullness)}
          type="food-bar"
        />
        <span className="stat-text">
          Еда {format(pet.fullness ?? 0)}/{MAX.fullness}
        </span>
      </div>

      <div className="stat">
        <img src="/assets/bar/energy-icon.png" alt="Энергия" />
        <StatBar
          value={normalize(pet.energy ?? 0, MAX.energy)}
          type="energy-bar"
        />
        <span className="stat-text">
          Энергия {format(pet.energy ?? 0)}/{MAX.energy}
        </span>
      </div>

      <div className="stat">
        <img src="/assets/bar/happiness-icon.png" alt="Счастье" />
        <StatBar
          value={normalize(pet.happiness ?? 0, MAX.happiness)}
          type="happiness-bar"
        />
        <span className="stat-text">
          Счастье {format(pet.happiness ?? 0)}/{MAX.happiness}
        </span>
      </div>
    </div>
  );
}