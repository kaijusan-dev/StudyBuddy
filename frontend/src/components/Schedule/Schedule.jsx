import { useState, useEffect } from 'react';
import api from '../../api/api';
import styles from './Schedule.module.css';

export default function Schedule() {
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
    api.get('/schedule')
        .then(res => {
            const sorted = res.data.sort(
                (a, b) => new Date(a.start_time) - new Date(b.start_time)
            );
            setSchedule(sorted);
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