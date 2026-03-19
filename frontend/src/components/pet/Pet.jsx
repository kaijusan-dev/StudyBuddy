import PetActions from "./PetActions";
import PetStats from "./PetStats";
import PetAvatar from "./PetAvatar";
import "./Pet.css";

export default function Pet({pet, onFeed}) {
    return (
        <div className="Pet">
            <h1>Your Pet</h1>

            <PetStats pet={pet} />

            <PetAvatar pet={pet} />

            <PetActions pet={pet} onFeed={onFeed} />  
        </div>
    )
}