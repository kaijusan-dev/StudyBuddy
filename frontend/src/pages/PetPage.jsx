import PetStatus from "../components/pet/PetStatus";
import PetActions from "../components/pet/PetActions";
import SidebarButtons from "../components/sidebar/SidebarButtons";
import Modal from "../components/modal/Modal";
import { usePet } from "../context/PetSocketContext";
import { useEffect, useState } from "react";
import DailySchedule from "../components/schedule/DailySchedule/DailySchedule";
import '../components/pet/Pet.css';
import PetAvatar from "../components/pet/PetAvatar";
import ScheduleForm from "../components/forms/ScheduleForm";
import { calendarUrlSchema } from "../schemas/schedule.schemas";
import api from "../api/api";
import useSchedule from "../hooks/useSchedule";

export default function PetPage() {

  const [state, setState] = useState({
    calendar_url: '', 
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {

    const result = calendarUrlSchema.safeParse(state);

    if (!result.success) {
        const fieldErrors = {};

        result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
        })

        setErrors(fieldErrors);
        return;
    }
    
    setErrors({});

    try {
      const {calendar_url} = result.data;
      
      await api.post('/schedule/update', {calendar_url});

      const updatedSchedule = await api.get('/schedule');

      setSchedule(updatedSchedule.data);

      handleCloseModal();

      setIsSchedule(true);
      
    } catch (err) {
        console.error(err);
        setErrors({
            server: err.response?.data?.message || "Server error"
      });
    }
  }

  const {schedule, setSchedule} = useSchedule();
  
  const isSchedule = schedule.length > 0;

  const {pet} = usePet();

  const [openModal, setOpenModal] = useState(null);
  const handleOpenModal = (modalName) => setOpenModal(modalName);
  const handleCloseModal = () => setOpenModal(null);

   if (!pet) return <div>Loading pet...</div>;

  return (
    <div className="pet-page">
      <header className="pet-status">
        {isSchedule && <PetStatus />}
      </header>

      <div className="left-panel">
        <SidebarButtons onClick={handleOpenModal}/>
      </div>

      <div className="pet-area">
        {isSchedule && <PetAvatar/>}
      </div>

      <div className="right-panel">
        <DailySchedule handleOpenModal={handleOpenModal}/>
      </div>

      <footer className="pet-actions">
        {isSchedule && <PetActions />}
      </footer>

      {openModal && (
        <Modal onClose={handleCloseModal}>
          {openModal === "profile" && <div>Профиль</div>}
          {openModal === "achievements" && <div>Достижения</div>}
          {openModal === "leaderboard" && <div>Leaderboard</div>}
          {openModal === "schedule" && 
            <ScheduleForm 
              state={state} 
              setState={setState} 
              errors={errors} 
              handleSubmit={handleSubmit}
              handleCloseModal={handleCloseModal}
            />
          }
        </Modal>
      )}

    </div>

    
  );
}