import { usePet } from "../../context/PetSocketContext";
import Button from "../buttons/Button";
import './Pet.css'

export default function PetActions() {
  const {pet, feedPet} = usePet();
  return (
    <div className="pet-actions">
      <div className="action">
        <img src="/assets/actions/feed-action.png" alt="feed"/>
        <Button onClick={feedPet} disabled={pet.fullness == 100} variant="action" >Покормить</Button>
      </div>
      
      <div className="action">
        <img src="/assets/actions/play-action.png" alt="play"/>
        <Button onClick={feedPet} disabled={pet.fullness == 100} variant="action">Поиграть</Button>
      </div>

      <div className="action">
        <img src="/assets/actions/caress-action.png" alt="caress"/>
        <Button onClick={feedPet} disabled={pet.fullness == 100} variant="action">Погладить</Button>
      </div>
    </div>
  );
}