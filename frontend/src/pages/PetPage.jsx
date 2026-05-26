import { useState } from "react";

import api from "../api/api";

import { usePet } from "../context/PetSocketContext";
import { useSchedule } from "../context/ScheduleContext";

import { calendarUrlSchema } from "../schemas/schedule.schemas";

import Modal from "../components/modal/Modal";

import Pet from "../components/pet/Pet";
import PetAvatar from "../components/pet/PetAvatar";
import PetActions from "../components/pet/PetActions";
import PetStatus from "../components/pet/PetStatus";

import SidebarButtons from "../components/sidebar/SidebarButtons";

import DailySchedule from "../components/schedule/DailySchedule/DailySchedule";

import ScheduleForm from "../components/forms/ScheduleForm";

import Profile from "../components/profile/Profile";
import Achievements from "../components/achievements/Achievements";
import Leaderboard from "../components/leaderboard/Leaderboard";

import "../components/pet/Pet.css";

  export default function PetPage() {

    const [state, setState] = useState({
      calendar_url: '', 
      tg_id: '',
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
        const {calendar_url, tg_id} = result.data;
        
        await api.post('/schedule/update', {calendar_url});

        await api.post('/profile/telegram', {tg_id});

        await fetchSchedule();

        handleCloseModal();
        
      } catch (err) {
          console.error(err);
          setErrors({
              server: err.response?.data?.message || "Server error"
        });
      }
    }

    const {schedule, setSchedule, fetchSchedule, loading } = useSchedule();
    
    const hasSchedule = !loading && schedule.length > 0;

    const {pet} = usePet();

    const [openModal, setOpenModal] = useState(null);
    const handleOpenModal = (modalName) => setOpenModal(modalName);
    const handleCloseModal = () => setOpenModal(null);

    if (!pet || loading) {
      return <div>Loading...</div>;
    }

    return (
      <>
        {/* Обязательная модалка */}
        {!hasSchedule && (
          <Modal onClose={handleCloseModal}>
            <ScheduleForm 
              state={state} 
              setState={setState} 
              errors={errors} 
              handleSubmit={handleSubmit}
            />
          </Modal>
        )
        }

        {hasSchedule && 
          (
          <div className="pet-page">

            <div className="left-panel">
              <SidebarButtons onClick={handleOpenModal}/>
            </div>

            <Pet />

            <div className="right-panel">
              <PetStatus />
              <DailySchedule handleOpenModal={handleOpenModal}/>
            </div>

            {/* Обычные модалки */}
            {openModal && (
              <Modal onClose={handleCloseModal}>
                {openModal === "profile" && <Profile />}
                {openModal === "achievements" && <Achievements />}
              </Modal>
            )}
          </div>
          )
        }
      </>
    )
  }