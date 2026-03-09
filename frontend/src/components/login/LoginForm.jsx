import Input from "../input/Input";

export default function LoginForm({state, setState, sendResult}) {
    return (
        <div className="LoginForm">
            <form onSubmit={(e) => {
                sendResult(state);
            }}>

            <Input name = 'nickname/email' label= 'Имя / email' type='text' state={state} setState={setState}/>
            <Input name = 'password' label= 'Пароль' type='text' state={state} setState={setState}/>
            <hr />
            <button type="submit">Войти</button>
            </form>
        </div>
    )
}