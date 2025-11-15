
import React, { useState, useEffect } from 'react';

export const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const timeString = new Intl.DateTimeFormat('de-AT', {
        timeZone: 'Europe/Vienna',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(time);
    
    const [hours, minutes] = timeString.split(':');

    const dayString = new Intl.DateTimeFormat('de-AT', {
        timeZone: 'Europe/Vienna',
        weekday: 'long'
    }).format(time);

    return (
        <div className="bg-surface-light p-6 rounded-2xl text-center shadow-lg">
            <div className="flex justify-center items-center gap-2 text-7xl font-bold text-accent tracking-tighter">
                <span>{hours}</span>
                <span className="animate-pulse">:</span>
                <span>{minutes}</span>
            </div>
            <div className="text-secondary uppercase tracking-widest mt-1 text-sm">
                {dayString}
            </div>
        </div>
    );
};
