import Button from "../buttons/Button";
import Error from "../error/Error";
import Input from "../input/Input";
import styles from './Forms.module.css';

export default function LoginForm({state, setState, handleSubmit, errors}) {
    return (
        <div className="LoginForm">
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h1 className={styles.title}>Вход</h1>
                </div>
                <form className={styles.form} onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('login');
                }}>
                    
                    {errors.server && <Error message={errors.server} />}

                    <Input name = 'identifier' label= 'Имя пользователя / email' type='text' state={state} setState={setState}/>
                    {errors.email && <Error message={errors.email} />}
                    {errors.username && <Error message={errors.username} />}

                    <Input name = 'password' label= 'Пароль' type='password' state={state} setState={setState}/>
                    {errors.password && <Error message={errors.password} />}

                    <Button type="submit" variant='enter'>Войти</Button>
                </form> 
            </div>
        </div>
    )
}