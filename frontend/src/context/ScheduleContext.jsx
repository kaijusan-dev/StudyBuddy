import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { isSameDay } from "../components/schedule/schedule.utils.js";

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/schedule')
            .then(res => {
                const sorted = res.data.sort(
                    (a, b) => new Date(a.start_time) - new Date(b.start_time)
                );
                setSchedule(sorted);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const createEvent = async (payload) => {
        const res = await api.post(`/admin/schedule`, payload);

        const event = res.data;

        setSchedule(prev => {
            const updated = [...prev, event];
            return updated.sort(
            (a, b) => new Date(a.start_time) - new Date(b.start_time)
            );
        });

        return event;
    };

    const deleteEvent = async (id) => {
        try {
            await api.delete(`/admin/schedule/${id}`);

            setSchedule(prev =>
                prev.filter(e => e.id !== id)
            );

        } catch (err) {
            console.error("Ошибка при удалении события", err);
        }
    };

    const deleteAllToday = async () => {
        try {
            const todayEvents = schedule.filter(e =>
            isSameDay(new Date(e.start_time), new Date())
            );

            await Promise.all(
                todayEvents.map(e => api.delete(`/admin/schedule/${e.id}`))
            );

            setSchedule(prev =>
                prev.filter(e => !isSameDay(new Date(e.start_time), new Date()))
            );
        } catch (err) {
            console.error("Ошибка при удалении всех событий", err);
        }
    };

    return (
        <ScheduleContext.Provider value={{ schedule, setSchedule, loading, createEvent, deleteEvent, deleteAllToday }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export function useSchedule() {
  return useContext(ScheduleContext);
}