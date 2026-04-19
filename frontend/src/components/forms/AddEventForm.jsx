import Error from "../error/Error";
import Input from "../input/Input";
import styles from './Forms.module.css';

export default function AddEventForm({
  state,
  setState,
  handleSubmit,
  handleCloseModal,
  errors
}) {

  return (
    <div className="ScheduleForm">
      <h4>Добавление события</h4>

      <form className={styles.form} onSubmit={(e) => {
        e.preventDefault();
        handleSubmit('addEvent');
        if (Object.keys(errors).length === 0) handleCloseModal();
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

        <hr />
        <button type="submit">Добавить</button>
      </form>
    </div>
  );
}