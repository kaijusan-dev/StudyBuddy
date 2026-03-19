import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { usePetSocket } from "../hooks/usePetSocket";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Pet from "../components/pet/Pet";

export default function PetPage() {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
      if (!user) {
          navigate('/auth/login');
      }
  }, [user]);

  const token = localStorage.getItem("token");

  const { pet, feedPet } = usePetSocket(token);

  if (!user || !pet) return <p>Loading...</p>;

  return (
    <Pet
      pet={pet}
      onFeed={feedPet}
    />
  );
}