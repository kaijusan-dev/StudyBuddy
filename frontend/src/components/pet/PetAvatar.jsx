export default function PetAvatar({ pet }) {
  const getMood = () => {
    if (pet.fullness < 30) return "angry";
    if (pet.energy < 20) return "sleep";
    if (pet.happiness > 80) return "happy";
    return "idle";
  };

  const mood = getMood();

  return (
    <div className={`pet-avatar ${mood}`}>
      <div className="pet-face">
        {mood === "angry" && "😡"}
        {mood === "sleep" && "😴"}
        {mood === "happy" && "😄"}
        {mood === "idle" && "🙂"}
      </div>
    </div>
  );
}