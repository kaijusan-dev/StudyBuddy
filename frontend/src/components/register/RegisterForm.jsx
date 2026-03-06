import MyInput from "../input/MyInput";

export default function RegisterForm({state, setState, sendResult}) {
    return (
        <div className="RegisterForm">
            <form onSubmit={(e) => {
                e.preventDefault();
                sendResult(state);
            }}>

            <MyInput name = 'nickname' label= 'Имя' type='text' state={state} setState={setState}/>
            <MyInput name = 'email' label= 'Email' type='text' state={state} setState={setState}/>
            <MyInput name = 'group_id' label= 'Номер группы' type='text' state={state} setState={setState}/>
            <MyInput name = 'password' label= 'Пароль' type='text' state={state} setState={setState}/>
            <MyInput name = 'passwordAgain' label= 'Повторите пароль' type='text' state={state} setState={setState}/>
            <hr />
            <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    )
}