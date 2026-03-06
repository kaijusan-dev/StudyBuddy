import {useState} from 'react'
import RegisterForm from '../components/register/RegisterForm';
import LoginForm from '../components/login/LoginForm';
import api from '../api/api';

export default function AuthPage({type}) {

    const [state, setState] = useState({
        nickname: '', 
        email: '',
        group_id: '',
        password: '',
        passwordAgain: '',
    });

    const sendResult = (state) => {
        api.post('/auth', state)
            .then(res => console.log(res));
    };

    return (
        <div className="AuthPage">
            {type === 'register' 
                ? <RegisterForm state={state} setState={setState} sendResult={sendResult}/>
                : <LoginForm state={state} setState={setState} sendResult={sendResult}/>
            }
        </div>
    )
}
