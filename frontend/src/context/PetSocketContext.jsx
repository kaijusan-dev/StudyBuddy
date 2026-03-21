import { createContext, useContext } from "react";
import { usePetSocket } from "../hooks/usePetSocket";

const PetSocketContext = createContext(null);

export function PetSocketProvider({ children }) {

  const token = localStorage.getItem('token');

  const { pet, setPet, feedPet } = usePetSocket(token);

  return (
    <PetSocketContext.Provider value={{ pet, setPet, feedPet }}>
      {children}
    </PetSocketContext.Provider>
  );
}

export function usePet() {
  return useContext(PetSocketContext);
}