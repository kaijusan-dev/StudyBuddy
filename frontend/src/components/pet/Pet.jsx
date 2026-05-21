import PetActions from "./PetActions";
import PetAvatar from "./PetAvatar";
import PetBackground from "./PetBackground";
import { usePet } from "../../context/PetSocketContext";
import './Pet.css'

export default function Pet() {

  const { pet } = usePet();

  if (!pet) return <div>Loading pet...</div>;

  return (
    <div className="pet-layout">
      <div className="pet-area">
        <PetBackground />
        <PetAvatar />
      </div>

      <div className="pet-actions">
        <PetActions />
      </div>
    </div>
  );
}