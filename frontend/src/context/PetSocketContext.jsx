import { createContext, useContext } from "react";
import { usePetSocket } from "../hooks/usePetSocket";

const PetSocketContext = createContext(null);

export function PetSocketProvider({ children }) {

  const token = localStorage.getItem('token');

  const { socketRef, animation, pet, error, setPet, updateStat, feedPet, caressPet, playPet } = usePetSocket(token);

  return (
    <PetSocketContext.Provider value={{ socketRef, animation, pet, error, setPet, updateStat, feedPet, caressPet, playPet }}>
      {children}
    </PetSocketContext.Provider>
  );
}

export function usePet() {
  return useContext(PetSocketContext);
}