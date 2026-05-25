  import PetStatus from "../components/pet/PetStatus";
  import PetActions from "../components/pet/PetActions";
  import SidebarButtons from "../components/sidebar/SidebarButtons";
  import Modal from "../components/modal/Modal";
  import { usePet } from "../context/PetSocketContext";
  import { useState } from "react";
  import DailySchedule from "../components/schedule/DailySchedule/DailySchedule";
  import '../components/pet/Pet.css';
  import PetAvatar from "../components/pet/PetAvatar";
  import ScheduleForm from "../components/forms/ScheduleForm";
  import { calendarUrlSchema } from "../schemas/schedule.schemas";
  import api from "../api/api";
  import ProfilePage from "./ProfilePage";
  import { useSchedule } from "../context/ScheduleContext";
  import AchievementsPage from "./AchievementsPage";
  import Pet from "../components/pet/Pet";

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

        const updatedSchedule = await api.get('/schedule');

        setSchedule(updatedSchedule.data);

        handleCloseModal();
        
      } catch (err) {
          console.error(err);
          setErrors({
              server: err.response?.data?.message || "Server error"
        });
      }
    }

    const {schedule, setSchedule, loading } = useSchedule();
    
    const hasSchedule = schedule.length > 0;

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
                {openModal === "profile" && <ProfilePage />}
                {openModal === "achievements" && <AchievementsPage />}
                {openModal === "leaderboard" && <div>Leaderboard</div>}
              </Modal>
            )}
          </div>
          )
        }
      </>
    )
  }