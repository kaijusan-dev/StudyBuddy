import { usePet } from "../../context/PetSocketContext";
import "./Pet.css";

export default function PetAvatar() {
  const { pet, animation } = usePet();

  const getMood = () => {
    if (!pet) return "idle";
    if (pet.fullness < 10) return "hungry";
    if (pet.energy == 0) return "sleepy";
    if (pet.fullness >= 10 && pet.fullness <= 20) return "angry";
    if (pet.fullness > 20) return "happy";
    return "idle";
  };

  const mood = getMood();

  const currentState = animation || mood;

  return (
      <div className={`pet-avatar ${currentState}`} />
  );
}