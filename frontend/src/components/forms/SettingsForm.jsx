import Input from "../input/Input";
import Error from "../error/Error";

export default function SettingsForm({type, state, setState, handleSubmit, errors}) {
    return (
        <div className="SettingsForm">
            {type === 'general' && 
            <>
                <h1>Основные настройки</h1>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('general');
                }}>

                {errors.server && <Error message={errors.server} />}

                <Input name = 'username' label= 'Имя' type='text' state={state} setState={setState}/>
                {errors.username && <Error message={errors.username} />}

                <Input name = 'group_id' label= 'Номер группы' type='text' state={state} setState={setState}/>
                {errors.group_id && <Error message={errors.group_id} />}    

                <hr />
                <button type="submit">Отправить</button>
                </form>
            </>}
            {type === 'email' && 
            <>
                <h1>Email</h1>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('email');
                }}>

                {errors.server && <Error message={errors.server} />}

                <Input name = 'email' label= 'Email' type='text' state={state} setState={setState}/>
                {errors.email && <Error message={errors.email} />}

                <hr />
                <button type="submit">Отправить</button>
                </form>
            </>}
            {type === 'password' && 
            <>
                <h1>Пароль</h1>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit('password');
                }}>

                {errors.server && <Error message={errors.server} />}

                <Input name = 'password' label= 'Пароль' type='password' state={state} setState={setState}/>
                {errors.password && <Error message={errors.password} />}

                <Input name = 'passwordAgain' label= 'Повторите пароль' type='password' state={state} setState={setState}/>
                {errors.passwordAgain && <Error message={errors.passwordAgain} />}

                <hr />
                <button type="submit">Отправить</button>
                </form>
            </>}
        </div>
    )
}