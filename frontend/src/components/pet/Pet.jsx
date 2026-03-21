import PetActions from "./PetActions";
import PetStatus from "./PetStatus";
import PetAvatar from "./PetAvatar";
import "./Pet.css";
import { usePet } from "../../context/PetSocketContext";

export default function Pet() {
    const { pet } = usePet();
    if (!pet) return;
    return (
        <div className="Pet">
            <h1>Your Pet</h1>
            <PetStatus/>
            <PetAvatar/>
            <PetActions/>  
        </div>
    )
}