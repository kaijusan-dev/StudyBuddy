import { useState, useEffect } from 'react';
import api from '../api/api';

export default function useSchedule() {
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

    return { schedule, setSchedule, loading };
} 