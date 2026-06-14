import { usePet } from "../../context/PetSocketContext";
import Button from "../buttons/Button";
import './Pet.css'

export default function PetActions() {
  const {pet, feedPet, caressPet, playPet} = usePet();
  return (
    <div className="pet-actions">
      <div className="action">
        <img src="/assets/actions/feed-action-icon.png" alt="feed"/>
        <Button onClick={feedPet} disabled={pet.fullness >= 20} variant="action" >Покормить</Button>
      </div>
      
      <div className="action">
        <img src="/assets/actions/play-action-icon.png" alt="play"/>
        <Button onClick={playPet} disabled={pet.fullness == 100 || pet.energy == 0} variant="action">Поиграть</Button>
      </div>

      <div className="action">
        <img src="/assets/actions/caress-action-icon.png" alt="caress"/>
        <Button onClick={caressPet} disabled={pet.energy == 0} variant="action">Погладить</Button>
      </div>
    </div>
  );
}