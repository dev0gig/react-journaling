import React from 'react';

// Helper to render Google Fonts Material Symbols
const Icon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className }) => (
    <span className={`material-symbols-outlined inline-flex items-center justify-center ${className || ''}`}>{iconName}</span>
);

export const BalletShoesIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="theater_comedy" className={className} />;
export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="sparkles" className={className} />;
export const SpaIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="spa" className={className} />;
export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="lightbulb" className={className} />;
export const StarIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="star" className={className} />;
export const BowIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="redeem" className={className} />;
export const StatsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="stat_0" className={className} />;
export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="upload" className={className} />;
export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="download" className={className} />;
export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="settings" className={className} />;
export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="close" className={className} />;
export const EditIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="edit" className={className} />;
export const AddCircleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="add_circle" className={className} />;
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <Icon iconName="search" className={className} />;