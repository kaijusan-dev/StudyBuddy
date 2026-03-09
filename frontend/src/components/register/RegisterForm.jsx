import Input from "../input/Input";
import Error from "../error/Error";

export default function RegisterForm({state, setState, handleSubmit, errors}) {
    return (
        <div className="RegisterForm">
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('register');
            }}>

            <Input name = 'username' label= 'Имя' type='text' state={state} setState={setState}/>
            {errors.username && <Error message={errors.username} />}

            <Input name = 'email' label= 'Email' type='text' state={state} setState={setState}/>
            {errors.email && <Error message={errors.email} />}

            <Input name = 'group_id' label= 'Номер группы' type='text' state={state} setState={setState}/>
            {errors.group_id && <Error message={errors.group_id} />}

            <Input name = 'password' label= 'Пароль' type='password' state={state} setState={setState}/>
            {errors.password && <Error message={errors.password} />}

            <Input name = 'passwordAgain' label= 'Повторите пароль' type='password' state={state} setState={setState}/>
            {errors.passwordAgain && <Error message={errors.passwordAgain} />}

            <hr />
            <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    )
}