import {useState} from 'react'
import RegisterForm from '../components/register/RegisterForm';
import LoginForm from '../components/login/LoginForm';

export default function AuthPage({type}) {

    const [state, setState] = useState({
        nickname: '', 
        email: '',
        password: '',
        passwordAgain: '',
    });

    return (
        <div className="AuthPage">
            {type === 'register' 
                ? <RegisterForm state={state} setState={setState}/>
                : <LoginForm state={state} setState={setState}/>
            }
        </div>
    )
}
