import Schedule from "../components/Schedule/Schedule";

export default function SchedulePage() {
    return (
        <div className="SchedulePage">
            <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Расписание</h1>
            <p style={{ textAlign: 'center' }}>Здесь будет отображаться расписание, полученное с бэкенда.</p>
            <Schedule />
        </div>
    );
}   