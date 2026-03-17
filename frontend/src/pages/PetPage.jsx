import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { usePetSocket } from "../hooks/usePetSocket";

export default function PetPage() {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const { pet, feedPet } = usePetSocket(token);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>{user.username}'s Pet</h1>

      {pet ? (
        <>
          <p>Hunger: {pet.hunger}</p>
          <button onClick={feedPet}>🍖 Feed</button>
        </>
      ) : (
        <p>Loading pet...</p>
      )}
    </div>
  );
}