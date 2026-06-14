import Button from '../components/buttons/Button';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../styles/WelcomePage.css';


export default function WelcomePage() {

    const navigate = useNavigate();

    return (
        <div className="welcomePage">
            <div className="welcomeWindow">

                <h1 className="welcomeTitle">
                    StudyBuddy
                </h1>

                <div className="welcomeDescription">
                    Добро пожаловать в мир учебы, расписаний и питомцев.
                    Следи за временем, выполняй задачи и развивай своего
                    компаньона вместе с прогрессом.
                </div>

                <Button variant='base' onClick={() => navigate("/pet")}>Начать</Button>
            </div>
        </div>
    );
}