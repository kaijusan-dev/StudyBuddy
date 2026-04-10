import { useState, useEffect } from 'react';
import useSchedule from '../../../hooks/useSchedule';
import { isSameDay, formatTime } from '../schedule.utils';
import styles from './DailySchedule.module.css';
import api from '../../../api/api';

export default function DailySchedule({handleOpenModal}) {
    const { schedule, setSchedule, loading } = useSchedule();

    useEffect(() => {
        if (!loading && schedule.length === 0) {
            handleOpenModal('schedule');
        }
    }, [loading]);

    if(!schedule) return null;

    const today = new Date();
    today.setHours(0,0,0,0);

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const todayEvents = schedule.filter(event =>
        isSameDay(new Date(event.start_time), today)
    );

    const completeEvent = async (id) => {
        try {
            await api.post(`/schedule/${id}/complete`);

            setSchedule(prev =>
                prev.map(e =>
                    e.id === id ? { ...e, completed: true } : e
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const isAvailable = (event) => {
        const start = new Date(event.start_time);

        const endOfDay = new Date(start);
        endOfDay.setHours(23, 59, 59, 999);

        return now >= start && now <= endOfDay;
    };

    const isActive = (event) => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        return now >= start && now <= end;
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className={styles.container}>
            <h3>Сегодня</h3>

            {todayEvents.length === 0 ? (
                <p>Нет пар 🎉</p>
            ) : (
                todayEvents.map(event => (
                    <div
                        key={event.id}
                        className={`
                            ${styles.event}
                            ${event.completed ? styles.completed : ''}
                            ${isActive(event) ? styles.active : ''}
                        `}
                    >
                        <div>
                            <p>{event.summary}</p>
                             <span>
                                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                             </span>
                        </div>

                        <button
                            disabled={!isAvailable(event) || event.completed}
                            onClick={() => completeEvent(event.id)}
                        >
                            {event.completed ? '✔' : 'Отметить'}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}