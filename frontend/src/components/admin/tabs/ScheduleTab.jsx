import { useState } from "react";
import AddEventForm from "../../forms/AddEventForm";
import { formatTime, formatForInput, isSameDay } from "../../schedule/schedule.utils";
import { useAuth } from "../../../context/AuthContext";
import { useSchedule } from "../../../context/ScheduleContext";

export default function ScheduleTab() {
  const { schedule, createEvent, deleteEvent, deleteAllToday } = useSchedule();
  const {user} = useAuth();

  const [state, setState] = useState({
    summary: "",
    start_time: formatForInput(new Date()),
    end_time: formatForInput(new Date(new Date().getTime() + 60 * 60 * 1000)),
    user_id: user?.id || null,
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Сегодняшние события для удаления

  const todayEvents = schedule.filter(e => isSameDay(new Date(e.start_time), new Date()));

  const handleSubmit = async () => {
    if (
      !state.start_time ||
      !state.end_time ||
      !isSameDay(new Date(state.start_time), new Date()) ||
      !isSameDay(new Date(state.end_time), new Date())
    ) {
      setErrors({ server: "Можно добавлять только события на сегодня!" });
      return;
    }

    try {
      const payload = {
        ...state,
        start_time: new Date(state.start_time).toISOString(),
        end_time: new Date(state.end_time).toISOString(),
        user_id: user?.id,
      };

      await createEvent(payload);

      const now = new Date();
      const start = new Date(now);
      const end = new Date(now.getTime() + 60 * 60 * 1000);

      setState({
        summary: "",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      });

      setErrors({});

    } catch (err) {
      console.error(err);
      setErrors({ server: "Ошибка при добавлении события" });
    }
  };

  const createQuickEvent = async () => {
    const now = new Date();

    const start = new Date(now);
    const end = new Date(now.getTime() + 60 * 60 * 1000); // +1 час

    const payload = {
      summary: "Test Event",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      user_id: user?.id,
    };

    try {
      await createEvent(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Управление событиями на сегодня</h3>

      <button onClick={() => setShowModal(prev => !prev)}>
        Добавить событие
      </button>

      <button onClick={createQuickEvent}>
        Быстрое событие
      </button>

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