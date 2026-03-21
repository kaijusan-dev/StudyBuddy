import Pet from "../components/pet/Pet";
import { usePet } from "../context/PetSocketContext";

export default function PetPage() {

  const {pet} = usePet();

  if (!pet) return null;

  return (
    <Pet/>
  );
}