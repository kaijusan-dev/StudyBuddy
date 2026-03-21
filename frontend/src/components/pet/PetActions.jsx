import { usePet } from "../../context/PetSocketContext";

export default function PetActions() {
  const {pet, feedPet} = usePet();
  return (
    <div>
      <button onClick={feedPet} disabled={pet.fullness == 100}>🍖 Feed</button>
    </div>
  );
}