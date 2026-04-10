import Error from "../error/Error";
import Input from "../input/Input";

export default function AddEventForm({
  state,
  setState,
  handleSubmit,
  handleCloseModal,
  errors
}) {
  return (
    <div className="ScheduleForm">
      <h1>Добавление события</h1>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit('addEvent');
        handleCloseModal();
      }}>

        {errors.server && <Error message={errors.server} />}

        <Input
          name="summary"
          label="Название"
          type="text"
          state={state}
          setState={setState}
        />

        <Input
          name="start_time"
          label="Начало"
          type="datetime-local"
          state={state}
          setState={setState}
        />

        <Input
          name="end_time"
          label="Конец"
          type="datetime-local"
          state={state}
          setState={setState}
        />

        <Input
          name="user_id"
          label="ID пользователя"
          type="number"
          state={state}
          setState={setState}
        />

        <hr />
        <button type="submit">Добавить</button>
      </form>
    </div>
  );
}