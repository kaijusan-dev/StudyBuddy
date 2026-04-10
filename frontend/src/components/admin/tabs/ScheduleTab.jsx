import { useState } from "react";
import useSchedule from "../../../hooks/useSchedule";
import api from "../../../api/api";
import AddEventForm from "../../forms/AddEventForm";
import { formatTime } from "../../schedule/schedule.utils";

export default function ScheduleTab() {
  const { schedule, setSchedule } = useSchedule();

  const [state, setState] = useState({
    summary: "",
    start_time: "",
    end_time: "",
    user_id: "",
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Сегодняшние события для удаления
  const today = new Date().toISOString().split("T")[0];
  const todayEvents = schedule.filter(e => e.start_time.startsWith(today));
  
  const handleSubmit = async (type) => {
    if (type === "addEvent") {
      if (!state.start_time.startsWith(today)) {
        setErrors({ server: "Можно добавлять только события на сегодня!" });
        return;
      }

      try {
        const payload = {
          ...state,
          start_time: new Date(state.start_time).toISOString(),
          end_time: new Date(state.end_time).toISOString(),
        };

        const res = await api.post(`/admin/schedule`, payload);

        if (res.data?.event) {
          setSchedule(prev => [...prev, res.data.event]);
        }

        setState({
          summary: "",
          start_time: today + "T09:00",
          end_time: today + "T10:00",
          user_id: "",
        });
        setErrors({});
        setShowModal(false);
      } catch (err) {
        console.error(err);
        setErrors({ server: "Ошибка при добавлении события" });
      }
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/admin/schedule/${id}`);
      setSchedule(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error("Ошибка при удалении события", err);
    }
  };

  const deleteAllToday = async () => {
    try {
      await Promise.all(todayEvents.map(e => api.delete(`/admin/schedule/${e.id}`)));
      setSchedule(prev => prev.filter(e => !e.start_time.startsWith(today)));
    } catch (err) {
      console.error("Ошибка при удалении всех событий", err);
    }
  };

  return (
    <div>
      <h3>Управление событиями на сегодня</h3>
      <button onClick={() => setShowModal(true)}>Добавить событие</button>
      {todayEvents.length > 0 && (
        <button onClick={deleteAllToday}>
          Удалить все события сегодня
        </button>
      )}

      {showModal && (
        <AddEventForm
          state={state}
          setState={setState}
          handleSubmit={handleSubmit}
          handleCloseModal={() => setShowModal(false)}
          errors={errors}
        />
      )}

      {/* Список для удаления отдельных событий */}
      <div style={{ marginTop: 20 }}>
        {todayEvents.length === 0 && <p>Сегодня нет событий</p>}
      <div>
        {todayEvents.map(event => (
          <div
            key={event.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 8
            }}
          >
            <div>
              <b>{event.summary}</b> <br />
              <span>{`${formatTime(event.start_time)}-${formatTime(event.end_time)}`}</span>
            </div>
            <button onClick={() => deleteEvent(event.id)}>Удалить</button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}