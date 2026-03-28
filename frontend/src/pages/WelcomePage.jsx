
import api from "../api/api";

export default function WelcomePage() {
    const res = api.post('/admin/something');
    console.log(res.data);
    return (
        <div className="WelcomePage">
            <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Главная страница</h1>
            <p style={{ textAlign: 'center' }}>не знаю что тут должно показываться</p>
        </div>
    );
}   