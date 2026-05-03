import { usePet } from "../../context/PetSocketContext";
import "./Pet.css";

export default function PetAvatar() {
  const {pet} = usePet();
  
  const getMood = () => {
    if (pet.fullness < 10) return "angry";
    if (pet.fullness > 20) return "happy";
    return "idle";
  };

  const mood = getMood();

  return (
    <div className={`pet-avatar ${mood}`} />
  );
}