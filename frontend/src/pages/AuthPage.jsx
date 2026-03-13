import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import RegisterForm from '../components/register/RegisterForm';
import LoginForm from '../components/login/LoginForm';
import api from '../api/api';
import { loginSchema, registerSchema } from '../schemas/auth.schemas';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AuthPage({type}) {

    const [state, setState] = useState({
        username: '', 
        email: '',
        identifier: '',
        group_id: '',
        password: '',
        passwordAgain: '',
    });

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const {login} = useContext(AuthContext);

    const handleSubmit = async () => {

        const schema = type === 'register' ? registerSchema : loginSchema;
        const result = schema.safeParse(state);

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
            if (type === 'register') {
                const {username, email, password, group_id} = result.data;
                const payload = { username, email, password, group_id };
                console.log("Payload for register:", payload);
                await api.post('/auth/register', payload);

                navigate('/auth/login');
            }
            else {
                const {identifier, password} = result.data;
                const payload = { identifier, password };

                const res = await api.post('/auth/login', payload);

                login(res.data.user, res.data.token);

                navigate('/pet');
            }
        } catch (err) {
            console.error(err);
            setErrors({
                server: err.response?.data?.message || "Server error"
            });
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
