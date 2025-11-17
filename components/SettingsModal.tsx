import React, { useState, useEffect } from 'react';
import { themes, DEFAULT_BANNER_URL } from '../constants';
import { CloseIcon, UploadIcon, DownloadIcon, BowIcon, DeleteIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUrl: string;
    currentPositionY: number;
    onSave: (url: string, positionY: number) => void;
    onSwitchToConverter: () => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    currentThemeId: string;
    onThemeChange: (themeId: string) => void;
    onDeleteAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUrl, currentPositionY, onSave, onSwitchToConverter, onExport, onImport, currentThemeId, onThemeChange, onDeleteAll }) => {
    const [url, setUrl] = useState(currentUrl);
    const [positionY, setPositionY] = useState(currentPositionY);

    useEffect(() => {
        setUrl(currentUrl);
        setPositionY(currentPositionY);
    }, [currentUrl, currentPositionY, isOpen]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const handleSave = () => {
        onSave(url, positionY);
        onClose();
    };

    const handleRemove = () => {
        onSave('', 50);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div 
                className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md p-6 m-4 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="settings-title" className="text-lg font-bold text-primary">Einstellungen</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary transition-colors" aria-label="Einstellungen schließen">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div>
                    <label htmlFor="banner-url" className="block text-sm font-medium text-secondary mb-1">
                        Banner Bild URL
                    </label>
                    <p className="text-xs text-secondary/70 mb-2">Leer lassen für Standard-Banner</p>
                    <input
                        type="url"
                        id="banner-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-surface-light border border-border rounded-md px-3 py-2 text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="https://beispiel.com/bild.jpg"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="banner-position" className="block text-sm font-medium text-secondary mb-2">
                        Vertikale Position
                    </label>
                    <div
                        className="w-full h-24 rounded-md bg-cover bg-no-repeat mb-3 border border-border"
                        style={{
                            backgroundImage: `url('${url || DEFAULT_BANNER_URL}')`,
                            backgroundPosition: `center ${positionY}%`
                        }}
                        role="img"
                        aria-label="Banner Vorschau"
                    ></div>
                    <input
                        type="range"
                        id="banner-position"
                        min="0"
                        max="100"
                        value={positionY}
                        onChange={(e) => setPositionY(Number(e.target.value))}
                        className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer accent-accent"
                        aria-label="Banner Position anpassen"
                    />
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={handleRemove}
                        className="px-4 py-2 rounded-md text-sm font-semibold text-secondary bg-surface-light hover:bg-border hover:text-primary transition-colors"
                        aria-label="Banner-URL entfernen und Standard-Banner anzeigen"
                    >
                        Entfernen
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 rounded-md text-sm font-semibold text-primary bg-surface-light hover:bg-border transition-colors">
                            Abbrechen
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-4 py-2 rounded-md text-sm font-semibold bg-accent text-background hover:opacity-90 transition-opacity">
                            Speichern
                        </button>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-medium text-secondary mb-3">
                        Farbschema
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => onThemeChange(theme.id)}
                                className={`
                                    relative w-full h-12 rounded-lg flex flex-col items-center justify-center p-1 group
                                    ring-2 ring-offset-2 ring-offset-surface transition-all
                                    ${currentThemeId === theme.id ? 'ring-accent' : 'ring-transparent hover:ring-secondary/50'}
                                `}
                                aria-label={`Farbschema ${theme.name} auswählen`}
                                aria-pressed={currentThemeId === theme.id}
                            >
                                <div className="flex -space-x-2 pointer-events-none">
                                    <div className="w-6 h-6 rounded-full border-2 border-surface" style={{ backgroundColor: theme.colors['--color-accent'] }}></div>
                                    <div className="w-6 h-6 rounded-full border-2 border-surface" style={{ backgroundColor: theme.colors['--color-secondary'] }}></div>
                                    <div className="w-6 h-6 rounded-full border-2 border-surface" style={{ backgroundColor: theme.colors['--color-background'] }}></div>
                                </div>
                                <span className="absolute -bottom-5 text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-sm font-medium text-secondary mb-3">
                        Datenverwaltung & Werkzeuge
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <label className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-light hover:bg-border transition-colors cursor-pointer aspect-square">
                            <UploadIcon className="w-7 h-7 mb-2 text-accent-green"/>
                            <span className="text-primary text-sm font-normal">Journal importieren</span>
                            <input type="file" className="hidden" onChange={onImport} accept=".md,.zip" multiple />
                        </label>
                        
                        <button onClick={onExport} className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-light hover:bg-border transition-colors aspect-square">
                            <DownloadIcon className="w-7 h-7 mb-2 text-accent-sky"/>
                            <span className="text-primary text-sm font-normal">Journal exportieren</span>
                        </button>
                        
                        <button 
                            onClick={onSwitchToConverter}
                            className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-light hover:bg-border transition-colors aspect-square"
                        >
                            <BowIcon className="w-7 h-7 mb-2 text-accent"/>
                            <span className="text-primary text-sm font-normal">Moleskine Konverter</span>
                        </button>
                    </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-sm font-bold text-red-400 mb-3">
                        Gefahrenzone
                    </h3>
                    <button 
                        onClick={onDeleteAll}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-200 bg-red-900/40 border border-red-500/50 rounded-md transition-colors duration-200 hover:bg-red-900/60"
                    >
                        <DeleteIcon className="w-5 h-5" />
                        <span>Alle Einträge löschen</span>
                    </button>
                    <p className="text-xs text-secondary text-center mt-2">
                        Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden.
                    </p>
                </div>
            </div>
        </div>
    );
};