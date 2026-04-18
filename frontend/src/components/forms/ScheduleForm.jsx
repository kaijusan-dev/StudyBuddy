import Input from "../input/Input";
import Error from "../error/Error";
import styles from './Forms.module.css';
import Button from "../buttons/Button";

export default function ScheduleForm({state, setState, handleSubmit, handleCloseModal, errors}) {
    return (
        <div className="ScheduleForm">
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h1 className={styles.title}>Расписание</h1>
                </div>  
                <form className={styles.form} onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('schedule');
                    handleCloseModal();
                }}>

                    {errors.server && <Error message={errors.server} />}

                    <Input name = 'calendar_url' label= 'Ссылка на расписание ЕТИС' type='text' state={state} setState={setState}/>
                    {errors.calendar_url && <Error message={errors.calendar_url} />}

                    <Button type="submit" variant='base'>Отправить</Button>
                </form> 
            </div>
        </div>
    )
}