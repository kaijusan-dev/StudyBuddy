import { usePet } from "../../context/PetSocketContext";
import StatBar from "./bar/StatBar";
import './Pet.css'

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

      <h3 className='title'>Состояние</h3>       

      <div className='stat'>
        <img src="/assets/bar/food-icon.png" />

        <StatBar
          value={normalize(pet.fullness ?? 0, MAX.fullness)}
          type="food-bar"
        />

        <span className='stat-text'>
          {format(pet.fullness ?? 0)}/{MAX.fullness}
        </span>

      </div>

      <div className='stat'>
        <img src="/assets/bar/energy-icon.png" />

        <StatBar
          value={normalize(pet.energy ?? 0, MAX.energy)}
          type="energy-bar"
        />

        <span className='stat-text'>
          {format(pet.energy ?? 0)}/{MAX.energy}
        </span>

      </div>

      <div className='stat'>
        <img src="/assets/bar/happiness-icon.png" />

        <StatBar
          value={normalize(pet.happiness ?? 0, MAX.happiness)}
          type="happiness-bar"
        />

        <span className='stat-text'>
          {format(pet.happiness ?? 0)}/{MAX.happiness}
        </span>
      </div>
    </div>
  );
}