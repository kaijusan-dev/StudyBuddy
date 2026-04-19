import { usePet } from "../../context/PetSocketContext";

export default function PetStatus() {
  const { pet } = usePet();

  if (!pet) return null;

  return (
    <div>
      <p>Fullness: <progress value={pet.fullness} max="100" /></p>
      {/* <p>Energy: <progress value={pet.energy} max="100" /></p>
      <p>Happiness: <progress value={pet.happiness} max="100" /></p> */}
    </div>
  );
}