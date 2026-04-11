import { usePet } from "../../context/PetSocketContext";
import "./Pet.css";

export default function PetAvatar() {
  const {pet} = usePet();
  
  const getMood = () => {
    if (pet.fullness < 30) return "angry";
    if (pet.fullness > 80) return "happy";
    return "idle";
  };

  const mood = getMood();

  return (
    <div className={`pet-avatar ${mood}`} />
  );
}