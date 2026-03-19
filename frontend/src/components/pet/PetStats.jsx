import { useEffect } from "react";
import { useState } from "react";

export default function PetStats({ pet }) {
  const [fullness, setFullness] = useState(pet?.fullness || 0);
  useEffect(() => {
    if (!pet) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - new Date(pet.last_updated).getTime()) / 1000;
      const newFullness = Math.max(0, pet.fullness - diffSec * 0.1);
      setFullness(newFullness);
    }, 1000)

    return () => clearInterval(interval);
  }, [pet]);

  return (
    <div>
      <p>Fullness: <progress value={fullness} max="100" /></p>
      <p>Energy: <progress value={pet.energy} max="100" /></p>
      <p>Happiness: <progress value={pet.happiness} max="100" /></p>
    </div>
  );
}