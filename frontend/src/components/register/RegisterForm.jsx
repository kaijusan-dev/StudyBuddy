import Input from "../input/Input";

export default function RegisterForm({state, setState, sendResult}) {
    return (
        <div className="RegisterForm">
            <form onSubmit={(e) => {
                e.preventDefault();
                sendResult(state);
            }}>

            <Input name = 'nickname' label= 'Имя' type='text' state={state} setState={setState}/>
            <Input name = 'email' label= 'Email' type='text' state={state} setState={setState}/>
            <Input name = 'group_id' label= 'Номер группы' type='text' state={state} setState={setState}/>
            <Input name = 'password' label= 'Пароль' type='text' state={state} setState={setState}/>
            <Input name = 'passwordAgain' label= 'Повторите пароль' type='text' state={state} setState={setState}/>
            <hr />
            <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    )
}