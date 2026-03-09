import Error from "../error/Error";
import Input from "../input/Input";

export default function LoginForm({state, setState, handleSubmit, errors}) {
    return (
        <div className="LoginForm">
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('login');
            }}>

            <Input name = 'username/email' label= 'Имя пользователя / email' type='text' state={state} setState={setState}/>
            {errors.email && <Error message={errors.email} />}
            {errors.username && <Error message={errors.username} />}

            <Input name = 'password' label= 'Пароль' type='password' state={state} setState={setState}/>
            {errors.password && <Error message={errors.password} />}

            <hr />
            <button type="submit">Войти</button>
            </form>
        </div>
    )
}