import { createContext, useContext } from "react";
import { usePetSocket } from "../hooks/usePetSocket";

const PetSocketContext = createContext(null);

export function PetSocketProvider({ children }) {

  const token = localStorage.getItem('token');

  const { socketRef, pet, setPet, updateStat, feedPet } = usePetSocket(token);

  return (
    <PetSocketContext.Provider value={{ socketRef, pet, setPet, updateStat, feedPet }}>
      {children}
    </PetSocketContext.Provider>
  );
}

export function usePet() {
  return useContext(PetSocketContext);
}