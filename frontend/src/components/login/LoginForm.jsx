import MyInput from "../input/MyInput";

export default function LoginForm({state, setState}) {
    return (
        <div className="LoginForm">
            <form onSubmit={(e) => {
                e.preventDefault();
                console.info('Submited', state);
            }}>

            <MyInput name = 'nickname/email' label= 'Имя / email' type='text' state={state} setState={setState}/>
            <MyInput name = 'password' label= 'Пароль' type='text' state={state} setState={setState}/>
            <hr />
            <button type="submit">Отправить</button>
            </form>
        </div>
    )
}