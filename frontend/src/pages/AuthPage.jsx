import {useState} from 'react'
import RegisterForm from '../components/register/RegisterForm';
import LoginForm from '../components/login/LoginForm';
import api from '../api/api';
import { loginSchema, registerSchema } from '../schemas/auth.schemas';

export default function AuthPage({type}) {

    const [state, setState] = useState({
        username: '', 
        email: '',
        group_id: '',
        password: '',
        passwordAgain: '',
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = async (type) => {

        let result;

        if (type === 'register') result = registerSchema.safeParse(state);
        else result = loginSchema.safeParse(state);

        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
            })

            setErrors(fieldErrors);
            return;
        }
        
        setErrors({});

        try {
            const res = await api.post(`/auth/${type || "login"}`, result.data);
            console.log(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="AuthPage">
            {type === 'register' 
                ? (
                <RegisterForm 
                    state={state} 
                    setState={setState} 
                    handleSubmit={handleSubmit} 
                    errors={errors} 
                />
                )
                : (
                <LoginForm 
                    state={state} 
                    setState={setState} 
                    handleSubmit={handleSubmit} 
                    errors={errors} 
                />
            )
            }
        </div>
    )
}
