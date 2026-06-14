import { useState, useEffect } from 'react';
import api from '../../api/api';
import styles from './Schedule.module.css';

export default function Schedule() {
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
        api.get('/schedule')
            .then(res => {
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0 (вс) - 6 (сб)
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // если вс => назад на 6 дней
                const monday = new Date(now);
                monday.setDate(now.getDate() + diffToMonday);
                monday.setHours(0,0,0,0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23,59,59,999);

                const filtered = res.data
                    .filter(event => {
                        const start = new Date(event.start_time);
                        return start >= monday && start <= sunday;
                    })
                    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

                setSchedule(filtered);
            })
            .catch(err => console.error("Error fetching schedule:", err));
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.Schedule}>
            {schedule.length === 0 ? (
                <p>Загрузка расписания...</p>
            ) : <table>
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Начало</th>
                            <th>Конец</th>
                            <th>Предмет</th>
                        </tr>
                    </thead>
                    <tbody> 
                        {schedule.map(event => (
                            <tr key={event.id}>
                                <td>{formatDate(event.start_time)}</td>
                                <td>{formatTime(event.start_time)}</td>
                                <td>{formatTime(event.end_time)}</td>
                                <td>{event.summary}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </div>
    );
}