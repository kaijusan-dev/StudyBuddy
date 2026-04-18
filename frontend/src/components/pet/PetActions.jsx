import { usePet } from "../../context/PetSocketContext";
import Button from "../buttons/Button";

export default function PetActions() {
  const {pet, feedPet} = usePet();
  return (
    <div>
      <Button onClick={feedPet} disabled={pet.fullness == 100} variant="action">Покормить</Button>
    </div>
  );
}