import { useState, useEffect } from 'react';
import { getWeekRange, formatDate, formatTime } from '../schedule.utils';
import styles from './WeeklySchedule.module.css';
import { useSchedule } from '../../../context/ScheduleContext';

export default function WeeklySchedule() {
    const { schedule, loading } = useSchedule();
    const [offset, setOffset] = useState(0);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const { monday, sunday } = getWeekRange(offset);

    const weekEvents = schedule.filter(event => {
        const start = new Date(event.start_time);
        return start >= monday && start <= sunday;
    });

    const isToday = (date) => {
        const d = new Date(date);
        return d.toDateString() === now.toDateString();
    };

    const isActive = (event) => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        return now >= start && now <= end;
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => setOffset(prev => prev - 1)}>⬅️</button>

                <span>
                    {formatDate(monday)} - {formatDate(sunday)}
                </span>

                <button onClick={() => setOffset(prev => prev + 1)}>➡️</button>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Начало</th>
                        <th>Конец</th>
                        <th>Предмет</th>
                    </tr>
                </thead>

                <tbody>
                    {weekEvents.map(event => (
                        <tr
                            key={event.id}
                            className={`
                                ${isToday(event.start_time) ? styles.today : ''}
                                ${isActive(event) ? styles.active : ''}
                            `}
                        >
                            <td>{formatDate(event.start_time)}</td>
                            <td>{formatTime(event.start_time)}</td>
                            <td>{formatTime(event.end_time)}</td>
                            <td>{event.summary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}