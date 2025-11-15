
import React, { useState, useMemo } from 'react';
import { Anecdote } from '../types';

export const Calendar = ({ entries }: { entries: Anecdote[] }) => {
    const [date, setDate] = useState(new Date());

    const entryDates = useMemo(() => {
        return new Set(entries.map(e => e.date));
    }, [entries]);

    const toISODateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getISOWeek = (d: Date) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return weekNo;
    };

    const handlePrevMonth = () => {
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setDate(new Date());
    };

    const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeekIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday is 0
    const lastDayOfMonthDate = lastDayOfMonth.getDate();

    const calendarDays = [];

    // Previous month's days
    for (let i = firstDayOfWeekIndex; i > 0; i--) {
        const day = new Date(year, month, 1 - i);
        calendarDays.push({ day: day.getDate(), date: day, isCurrentMonth: false });
    }

    // Current month's days
    for (let i = 1; i <= lastDayOfMonthDate; i++) {
        const day = new Date(year, month, i);
        calendarDays.push({ day: i, date: day, isCurrentMonth: true });
    }

    // Next month's days
    const totalDays = calendarDays.length;
    const nextDaysCount = 42 - totalDays; // Fill up to 6 weeks
    for (let i = 1; i <= nextDaysCount; i++) {
        const day = new Date(year, month + 1, i);
        calendarDays.push({ day: i, date: day, isCurrentMonth: false });
    }

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    const today = new Date();
    const isToday = (day: { isCurrentMonth: boolean, day: number }) => {
        return day.isCurrentMonth && 
               day.day === today.getDate() && 
               month === today.getMonth() && 
               year === today.getFullYear();
    }

    return (
      <div className="bg-surface-light p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-primary">{monthNames[month]} {year}</h3>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleToday}
                    className="px-3 py-1 text-xs font-semibold rounded-md bg-surface hover:bg-border transition-colors text-primary"
                >
                    Heute
                </button>
                <button 
                    onClick={handlePrevMonth} 
                    aria-label="Vorheriger Monat"
                    className="p-1 rounded-full hover:bg-surface transition-colors"
                >
                    <span className="material-symbols-outlined text-secondary hover:text-primary text-xl">chevron_left</span>
                </button>
                <button 
                    onClick={handleNextMonth} 
                    aria-label="Nächster Monat"
                    className="p-1 rounded-full hover:bg-surface transition-colors"
                >
                    <span className="material-symbols-outlined text-secondary hover:text-primary text-xl">chevron_right</span>
                </button>
            </div>
        </div>
        <div className="grid grid-cols-8 gap-y-2 text-center">
            <div className="text-xs font-bold text-secondary uppercase tracking-wider">KW</div>
            {daysOfWeek.map(day => (
                <div key={day} className="text-xs font-bold text-secondary uppercase tracking-wider">{day}</div>
            ))}

            {weeks.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                    <div className="flex justify-center items-center h-8 text-xs text-secondary/60 font-medium" role="rowheader">
                        {getISOWeek(week[0].date)}
                    </div>
                    {week.map((day, dayIndex) => {
                        const isDayToday = isToday(day);
                        const hasEntry = day.isCurrentMonth && entryDates.has(toISODateString(day.date));

                        return (
                            <div key={dayIndex} className="flex justify-center items-center h-8">
                                <span className={`
                                    relative flex items-center justify-center w-8 h-8 rounded-full text-sm
                                    ${day.isCurrentMonth ? 'text-primary' : 'text-secondary/40'}
                                    ${isDayToday ? 'bg-accent text-background font-bold' : ''}
                                `}>
                                    {day.day}
                                    {hasEntry && (
                                        <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isDayToday ? 'bg-background' : 'bg-accent'}`}></span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
      </div>
    );
};
