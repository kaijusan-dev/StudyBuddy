import Input from "../input/Input";
import Error from "../error/Error";

export default function ScheduleForm({state, setState, handleSubmit, handleCloseModal, errors}) {
    return (
        <div className="ScheduleForm">
            <h1>Расписание</h1>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('schedule');
                handleCloseModal();
            }}>

            {errors.server && <Error message={errors.server} />}

            <Input name = 'calendar_url' label= 'Ссылка на расписание ЕТИС' type='text' state={state} setState={setState}/>
            {errors.calendar_url && <Error message={errors.calendar_url} />}

            <hr />
            <button type="submit">Отправить</button>
            </form>
        </div>
    )
}