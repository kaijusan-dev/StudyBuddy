import { useState, useEffect } from 'react';
import { isSameDay, formatTime } from '../schedule.utils';
import styles from './DailySchedule.module.css';
import api from '../../../api/api';
import { useSchedule } from '../../../context/ScheduleContext';

export default function DailySchedule({handleOpenModal}) {
    const { schedule, setSchedule, loading } = useSchedule();

    useEffect(() => {
        if (!loading && schedule.length === 0) {
            handleOpenModal('schedule');
        }
    }, [loading]);

    if(!schedule) return null;

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const todayEvents = schedule.filter(e =>
        isSameDay(e.start_time, new Date())
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
        <div className={styles.window}>

            <h3 className={styles.title}>Сегодня</h3>       

            <div className={styles.content}>
    
                {todayEvents.length === 0 ? (
                    <p className={styles.empty}>Нет пар 🎉</p>
                ) : (
                    todayEvents.map(event => (
                    <div
                        key={event.id}
                        className={`
                        ${styles.item}
                        ${event.completed ? styles.completed : ''}
                        ${isActive(event) ? styles.active : ''}
                        `}
                    >
                        <div className={styles.info}>
                        <p>{event.summary}</p>
                        <span>
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                        </div>

                        {!event.completed &&
                            <button
                                className={styles.button}
                                disabled={!isAvailable(event) || event.completed}
                                onClick={() => completeEvent(event.id)}
                            >
                                Отметить
                            </button>
                        }    
                    </div>
                    ))
                )}
            </div>
        </div>
    );
}