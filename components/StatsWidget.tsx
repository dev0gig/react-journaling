
import React from 'react';
import { StatsIcon } from './icons';

interface StatsWidgetProps {
  totalEntries: number;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ totalEntries }) => {
  return (
    <div className="bg-surface-light p-6 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <StatsIcon className="w-8 h-8 text-accent-peach" />
        <h2 className="font-bold text-primary text-xl">Statistiken</h2>
      </div>
      <div className="flex items-baseline justify-between bg-surface p-4 rounded-lg">
        <span className="text-secondary">Gesamteinträge</span>
        <span className="text-3xl font-bold text-primary">{totalEntries}</span>
      </div>
    </div>
  );
};