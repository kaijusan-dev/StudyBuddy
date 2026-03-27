import { usePet } from "../../context/PetSocketContext";

export default function PetAvatar() {
  const {pet} = usePet();
  
  const getMood = () => {
    if (pet.fullness < 30) return "angry";
    if (pet.energy < 20) return "sleep";
    if (pet.happiness > 80) return "happy";
    return "idle";
  };

  const mood = getMood();

  return (
    <div className={`pet-avatar ${mood}`}>
      {mood === "angry" && <img src="/cat/angry.png" />}
      {mood === "happy" && <img src="/cat/happy.png" />}
      {mood === "idle" && <img src="/cat/idle.png" />}
    </div>
  );
}