





import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SettingsIcon, CloseIcon, SpaIcon, SearchIcon } from './components/icons';
import { applyTheme } from './services/themeGenerator';
import { initDB, getAllAnecdotes, saveAnecdote, saveAnecdotesBatch } from './services/db';
import { Anecdote } from './types';
import { downloadBlob, formatDateHeading } from './utils/helpers';
import { themes, DEFAULT_THEME_ID, DEFAULT_BANNER_URL } from './constants';
import { MoleskineConverter } from './components/MoleskineConverter';
import { SettingsModal } from './components/SettingsModal';
import { HeaderBanner } from './components/HeaderBanner';
import { Clock } from './components/Clock';
import { Calendar } from './components/Calendar';
import { MonthlySummary } from './components/MonthlySummary';
import { AnecdoteEntry } from './components/AnecdoteEntry';
import { StatsWidget } from './components/StatsWidget';


declare var JSZip: any;


// --- MAIN APP ---
function App() {
  const [currentView, setCurrentView] = useState('journal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(() => {
    return localStorage.getItem('journalBannerUrl') || DEFAULT_BANNER_URL;
  });
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('journalThemeId') || DEFAULT_THEME_ID;
  });
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [editingAnecdoteId, setEditingAnecdoteId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
        try {
            await initDB();
            const anecdotesFromDb = await getAllAnecdotes();
            setAnecdotes(anecdotesFromDb);
        } catch (error) {
            console.error("Failed to load data from DB", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('journalBannerUrl', bannerUrl);
  }, [bannerUrl]);

  useEffect(() => {
    localStorage.setItem('journalThemeId', themeId);
    const newTheme = themes.find(t => t.id === themeId)?.colors;
    if (newTheme) {
      applyTheme(newTheme);
    }
  }, [themeId]);
  
  const addEntriesToJournal = async (newEntries: Anecdote[]) => {
    await saveAnecdotesBatch(newEntries);
    setAnecdotes(prev => [...prev, ...newEntries]);
    setCurrentView('journal');
  };

  const handleSaveAnecdote = async (updatedAnecdote: Anecdote) => {
    await saveAnecdote(updatedAnecdote);
    setAnecdotes(prev => prev.map(a => a.id === updatedAnecdote.id ? updatedAnecdote : a));
    setEditingAnecdoteId(null);
  };

  const switchToConverter = () => {
    setCurrentView('converter');
    setIsSettingsOpen(false);
  };

  const handleExport = useCallback(async () => {
    if (anecdotes.length === 0) {
        alert("Keine Einträge zum Exportieren vorhanden.");
        return;
    }

    const groupedByDate = anecdotes.reduce((acc, anecdote) => {
        const date = anecdote.date;
        const existingContent = acc[date] || '';
        // Add a separator if content already exists for that day
        const separator = existingContent ? '\n\n---\n\n' : '';
        acc[date] = existingContent + separator + anecdote.text;
        return acc;
    }, {} as Record<string, string>);

    const entries = Object.entries(groupedByDate);

    if (entries.length === 1) {
        const [date, content] = entries[0];
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        downloadBlob(blob, `${date}.md`);
    } else {
        const zip = new JSZip();
        for (const [date, content] of entries) {
            zip.file(`${date}.md`, content);
        }
        // The JSZip library is not typed, so `generateAsync` returns a Promise<any>.
        // We cast the result to `Blob` to satisfy the `downloadBlob` function's signature.
        // Fix for: Type 'unknown' is not assignable to type 'BlobPart'.
        const zipBlob = (await zip.generateAsync({ type: 'blob' })) as Blob;
        downloadBlob(zipBlob, 'journal_export.zip');
    }
    setIsSettingsOpen(false);
  }, [anecdotes]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAnecdotes: Anecdote[] = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            for (const filename in zip.files) {
                const zipEntry = zip.files[filename];
                if (!zipEntry.dir && filename.endsWith('.md')) {
                    const date = filename.replace(/\.md$/, '').split('/').pop();
                    if (date && dateRegex.test(date)) {
                        const content = await zipEntry.async('string');
                        newAnecdotes.push({
                            id: `imported-${date}-${Date.now()}-${Math.random()}`,
                            date: date,
                            text: String(content),
                        });
                    }
                }
            }
        } else if (file.name.endsWith('.md')) {
            const date = file.name.replace(/\.md$/, '');
            if (dateRegex.test(date)) {
                const content = await file.text();
                newAnecdotes.push({
                    id: `imported-${date}-${Date.now()}-${Math.random()}`,
                    date: date,
                    text: content,
                });
            }
        }
    }
    
    if (newAnecdotes.length > 0) {
        await saveAnecdotesBatch(newAnecdotes);
        setAnecdotes(prev => [...prev, ...newAnecdotes]);
    }

    event.target.value = ''; // Reset input
    setIsSettingsOpen(false);
  }, []);

  const sortedAnecdotes = useMemo(() => 
    [...anecdotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [anecdotes]
  );

  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    anecdotes.forEach(a => {
        yearSet.add(new Date(a.date).getUTCFullYear());
    });
    return Array.from(yearSet).sort((a, b) => b - a); // Descending order
  }, [anecdotes]);

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    anecdotes.forEach(a => {
        const date = new Date(a.date);
        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
        monthSet.add(monthKey);
    });
    return Array.from(monthSet).sort().reverse();
  }, [anecdotes]);
  
  useEffect(() => {
    if (availableYears.length > 0) {
        const currentYear = selectedYear && availableYears.includes(selectedYear) ? selectedYear : availableYears[0];
        if (currentYear !== selectedYear) {
            setSelectedYear(currentYear);
        }

        const monthsForYear = availableMonths.filter(m => m.startsWith(String(currentYear)));
        
        if (monthsForYear.length > 0) {
            const currentMonth = selectedMonth && monthsForYear.includes(selectedMonth) ? selectedMonth : monthsForYear[0];
            if (currentMonth !== selectedMonth) {
                setSelectedMonth(currentMonth);
            }
        } else {
            setSelectedMonth(null);
        }
    } else {
        setSelectedYear(null);
        setSelectedMonth(null);
    }
  }, [anecdotes, availableYears, selectedYear, availableMonths, selectedMonth]);

  const filteredAnecdotes = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        if (!selectedMonth) return [];
        return sortedAnecdotes.filter(a => a.date.startsWith(selectedMonth));
      }
      return sortedAnecdotes.filter(a => a.text.toLowerCase().includes(query));
  }, [searchQuery, sortedAnecdotes, selectedMonth]);

  const groupedAnecdotes = filteredAnecdotes.reduce((acc: Record<string, Anecdote[]>, anecdote) => {
    const date = anecdote.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(anecdote);
    return acc;
}, {} as Record<string, Anecdote[]>);

  const availableMonthsInYear = useMemo(() => {
    if (!selectedYear) return [];
    return availableMonths.filter(m => m.startsWith(String(selectedYear)));
  }, [selectedYear, availableMonths]);

  const handlePrevMonth = () => {
    if (!selectedMonth) return;
    const currentIndex = availableMonthsInYear.indexOf(selectedMonth);
    if (currentIndex < availableMonthsInYear.length - 1) {
        setSelectedMonth(availableMonthsInYear[currentIndex + 1]);
    }
  };

  const handleNextMonth = () => {
      if (!selectedMonth) return;
      const currentIndex = availableMonthsInYear.indexOf(selectedMonth);
      if (currentIndex > 0) {
          setSelectedMonth(availableMonthsInYear[currentIndex - 1]);
      }
  };

  const formatMonthHeader = (monthStr: string) => {
      const [year, month] = monthStr.split('-');
      const date = new Date(Date.UTC(Number(year), Number(month) - 1));
      return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  };

  const monthlySummaryData = useMemo(() => {
    if (!selectedYear) return [];

    const monthCounts: Record<string, number> = {};
    anecdotes
        .filter(a => new Date(a.date).getUTCFullYear() === selectedYear)
        .forEach(a => {
            const date = new Date(a.date);
            const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        });

    return Array.from({ length: 12 }, (_, i) => {
        const month = 12 - i;
        const monthKey = `${selectedYear}-${String(month).padStart(2, '0')}`;
        const date = new Date(Date.UTC(selectedYear, month - 1, 1));
        const name = new Intl.DateTimeFormat('de-DE', { month: 'long', timeZone: 'UTC' }).format(date);
        return {
            key: monthKey,
            name: name,
            count: monthCounts[monthKey] || 0,
        };
    });
  }, [anecdotes, selectedYear]);

  const handleMonthSelect = (monthKey: string) => {
    setSelectedMonth(monthKey);
    setSearchQuery('');
  };

  const handleYearChange = (year: number) => {
      setSelectedYear(year);
      setSearchQuery('');
  };


  if (currentView === 'converter') {
    return <MoleskineConverter onBack={() => setCurrentView('journal')} onAddToJournal={addEntriesToJournal} />;
  }

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-secondary animate-pulse text-lg">Journal wird geladen...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-4 right-4 z-40 p-2 rounded-full text-white/80 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Einstellungen öffnen"
        >
            <SettingsIcon className="w-6 h-6" />
        </button>
        
        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentUrl={bannerUrl === DEFAULT_BANNER_URL ? '' : bannerUrl}
            onSave={setBannerUrl}
            onSwitchToConverter={switchToConverter}
            onExport={handleExport}
            onImport={handleImport}
            currentThemeId={themeId}
            onThemeChange={setThemeId}
        />
        
        <HeaderBanner imageUrl={bannerUrl || DEFAULT_BANNER_URL} />
        <main className="mx-auto px-4 sm:px-6 lg:px-12 mt-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column */}
                <div className="hidden lg:block lg:col-span-1 space-y-8">
                    <Clock />
                    <Calendar entries={anecdotes} />
                    <StatsWidget totalEntries={anecdotes.length} />
                    <MonthlySummary 
                        monthlyData={monthlySummaryData} 
                        selectedMonth={selectedMonth}
                        onMonthSelect={handleMonthSelect}
                        selectedYear={selectedYear}
                        availableYears={availableYears}
                        onYearChange={handleYearChange}
                    />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3">
                    {anecdotes.length === 0 ? (
                        <div className="bg-surface-light p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="mb-6">
                                <SpaIcon className="w-16 h-16 text-accent" />
                            </div>
                            <p className="text-secondary mt-2 max-w-md">
                                Es scheint, als gäbe es noch keine Einträge. Du kannst deine Moleskine-Notizen oder andere Markdown-Dateien über die Einstellungen importieren.
                            </p>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="mt-6 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-background bg-accent rounded-md transition-colors duration-200 hover:opacity-90"
                            >
                                <SettingsIcon className="w-5 h-5" />
                                <span>Importieren & Konfigurieren</span>
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="relative mb-6">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-secondary">
                                    <SearchIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Einträge durchsuchen..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-surface-light border border-transparent rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    aria-label="Einträge durchsuchen"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-secondary hover:text-primary transition-colors"
                                        aria-label="Suche löschen"
                                    >
                                        <CloseIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-primary">
                                    {searchQuery ? `Suchergebnisse` : (selectedMonth ? formatMonthHeader(selectedMonth) : 'Einträge')}
                                </h2>
                                {!searchQuery && availableMonthsInYear.length > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePrevMonth}
                                            disabled={selectedMonth ? availableMonthsInYear.indexOf(selectedMonth) === availableMonthsInYear.length - 1 : true}
                                            className="p-2 rounded-md bg-surface-light hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Vorheriger Monat"
                                        >
                                            <span className="material-symbols-outlined text-secondary hover:text-primary">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={handleNextMonth}
                                            disabled={selectedMonth ? availableMonthsInYear.indexOf(selectedMonth) === 0 : true}
                                            className="p-2 rounded-md bg-surface-light hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Nächster Monat"
                                        >
                                            <span className="material-symbols-outlined text-secondary hover:text-primary">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {Object.keys(groupedAnecdotes).length > 0 ? (
                                <div className="space-y-8">
                                    {/* Fix: Replaced Object.entries with Object.keys to avoid type inference issues with the `entries` value. */}
                                    {Object.keys(groupedAnecdotes).map((date) => (
                                        <div key={date}>
                                            <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b-2 border-border">
                                                {formatDateHeading(date)}
                                            </h2>
                                            <div className="space-y-4">
                                                {groupedAnecdotes[date].map((anecdote) => (
                                                    <AnecdoteEntry
                                                        key={anecdote.id}
                                                        anecdote={anecdote}
                                                        isEditing={editingAnecdoteId === anecdote.id}
                                                        onEdit={(id) => setEditingAnecdoteId(id)}
                                                        onSave={handleSaveAnecdote}
                                                        onCancel={() => setEditingAnecdoteId(null)}
                                                        searchQuery={searchQuery}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-surface-light p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px]">
                                    <SearchIcon className="w-12 h-12 text-secondary mb-4" />
                                    <p className="text-primary font-semibold">Keine Ergebnisse gefunden</p>
                                    <p className="text-secondary mt-1 max-w-md">
                                        {searchQuery ? `Für "${searchQuery}" wurden keine Einträge gefunden.` : 'Für diesen Monat gibt es keine Einträge.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

export default App;