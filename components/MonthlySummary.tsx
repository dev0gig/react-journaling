
import React from 'react';

interface MonthlySummaryProps {
    monthlyData: { key: string; name: string; count: number }[];
    selectedMonth: string | null;
    onMonthSelect: (monthKey: string) => void;
    selectedYear: number | null;
    availableYears: number[];
    onYearChange: (year: number) => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ 
    monthlyData, 
    selectedMonth, 
    onMonthSelect,
    selectedYear,
    availableYears,
    onYearChange 
}) => {
    if (!selectedYear) {
        return (
            <div className="bg-surface-light p-6 rounded-2xl shadow-lg">
                <h2 className="font-bold text-primary text-xl mb-4">Monatsübersicht</h2>
                <p className="text-sm text-secondary">Keine Einträge für eine Übersicht vorhanden.</p>
            </div>
        );
    }

    const currentYearIndex = availableYears.indexOf(selectedYear);
    const canGoPrev = currentYearIndex < availableYears.length - 1;
    const canGoNext = currentYearIndex > 0;

    const handlePrevYear = () => {
        if (canGoPrev) {
            onYearChange(availableYears[currentYearIndex + 1]);
        }
    };

    const handleNextYear = () => {
        if (canGoNext) {
            onYearChange(availableYears[currentYearIndex - 1]);
        }
    };

    return (
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-primary text-xl">Monatsübersicht</h2>
                {availableYears.length > 1 && (
                    <div className="flex items-center gap-1 bg-surface px-1 py-1 rounded-md">
                        <button
                            onClick={handlePrevYear}
                            disabled={!canGoPrev}
                            className="p-1 rounded-sm hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Vorheriges Jahr"
                        >
                            <span className="material-symbols-outlined text-secondary text-base">chevron_left</span>
                        </button>
                        <span className="font-semibold text-primary text-sm w-12 text-center" aria-live="polite">{selectedYear}</span>
                        <button
                            onClick={handleNextYear}
                            disabled={!canGoNext}
                            className="p-1 rounded-sm hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Nächstes Jahr"
                        >
                            <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                {monthlyData.map(monthItem => (
                    <button 
                        key={monthItem.key} 
                        onClick={() => onMonthSelect(monthItem.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${
                            selectedMonth === monthItem.key 
                                ? 'bg-highlight' 
                                : 'hover:bg-border'
                        }`}
                        aria-pressed={selectedMonth === monthItem.key}
                        disabled={monthItem.count === 0}
                    >
                         <span className={`text-sm font-semibold ${
                            selectedMonth === monthItem.key ? 'text-accent' : (monthItem.count > 0 ? 'text-primary' : 'text-secondary/50')
                         }`}>{monthItem.name}</span>
                         {monthItem.count > 0 && (
                            <span className={`text-xs font-mono px-2 py-1 rounded-md ${
                                selectedMonth === monthItem.key ? 'bg-accent/30 text-accent' : 'text-accent-lavender bg-surface'
                            }`}>
                                {monthItem.count}
                            </span>
                         )}
                    </button>
                ))}
            </div>
        </div>
    );
};
