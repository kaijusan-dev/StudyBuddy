import { useEffect } from "react";
import { usePet } from "../../context/PetSocketContext";

export default function PetStatus() {
  const { pet, setPet } = usePet();
  
  useEffect(() => {
    if (!pet) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = (now - new Date(pet.last_updated).getTime()) / 1000;
      const newFullness = Math.max(0, pet.fullness - diffSec * 0.1);
      setPet({...pet, fullness: newFullness});
    }, 1000)

    return () => clearInterval(interval);
  }, [pet]);

  return (
    <div>
      <p>Fullness: <progress value={pet.fullness} max="100" /></p>
      <p>Energy: <progress value={pet.energy} max="100" /></p>
      <p>Happiness: <progress value={pet.happiness} max="100" /></p>
    </div>
  );
}