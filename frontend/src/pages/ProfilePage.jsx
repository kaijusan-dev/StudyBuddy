import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SettingsForm from "../components/forms/SettingsForm";
import { emailSettingsSchema, generalSettingsSchema, passwordSettingsSchema } from "../schemas/profile.schemas";
import api from "../api/api";
import AvatarUpload from "../components/avatar-upload/AvatarUpload";
import '../styles/ProfilePage.css';

export default function ProfilePage() {

    const {user, setUser} = useAuth();

    useEffect(() => {
        if (user) {
            setGeneralState({ username: user.username, group_id: user.group_id });
            setEmailState({ email: user.email });
        }
    }, [user]);

    const [generalState, setGeneralState] = useState({
        username: user?.username || '',
        group_id: user?.group_id || ''
    });

    const [emailState, setEmailState] = useState({
        email: user?.email || ''
    });

    const [passwordState, setPasswordState] = useState({
        password: '',
        passwordAgain: ''
    });

    const [generalErrors, setGeneralErrors] = useState({});
    const [emailErrors, setEmailErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    const handleSubmit = async (type) => {

        let stateToSubmit, setErrorsForForm, schema;

        if (type === 'general') {
            schema = generalSettingsSchema;
            stateToSubmit = generalState;
            setErrorsForForm = setGeneralErrors;
        } else if (type === 'email') {
            schema = emailSettingsSchema;
            stateToSubmit = emailState;
            setErrorsForForm = setEmailErrors;
        } else if (type === 'password') {
            schema = passwordSettingsSchema;
            stateToSubmit = passwordState;
            setErrorsForForm = setPasswordErrors;
        }

        const result = schema.safeParse(stateToSubmit);

        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
            })

            setErrorsForForm(fieldErrors);
            return;
        }
        
        setErrorsForForm({});

        try {
            let updatedUser;
            if (type === 'general') {
                updatedUser = (await api.patch('/profile/general', result.data)).data;
            } else if (type === 'email') {
                updatedUser = (await api.patch('/profile/email', result.data)).data;
            } else if (type === 'password') {
                updatedUser = (await api.patch('/profile/password', result.data)).data;
            }
            setUser(updatedUser);
        } catch (err) {
            setErrorsForForm({ server: err.response?.data?.message || "Server error" });
        }
    }

    return (
        <div className="ProfilePage">

            <div className='profileCard'>
                {user && <AvatarUpload user={user} onUpload={setUser} />}

                <div className='info'>
                    <div className='row'>
                    <span>Имя</span>
                    <p>{user?.username}</p>
                    </div>

                    <div className='row'>
                    <span>Email</span>
                    <p>{user?.email}</p>
                    </div>

                    <div className='row'>
                    <span>Группа</span>
                    <p>{user?.group_id}</p>
                    </div>
                </div>
            </div>

            <SettingsForm 
                type={'general'}
                state={generalState} 
                setState={setGeneralState} 
                handleSubmit={handleSubmit} 
                errors={generalErrors} 
            />
            <SettingsForm 
                type={'email'}
                state={emailState} 
                setState={setEmailState} 
                handleSubmit={handleSubmit} 
                errors={emailErrors} 
            />
            <SettingsForm 
                type={'password'}
                state={passwordState} 
                setState={setPasswordState} 
                handleSubmit={handleSubmit} 
                errors={passwordErrors} 
            />
        </div>
    );
}   