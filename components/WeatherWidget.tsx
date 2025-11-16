import React, { useState, useEffect, useCallback } from 'react';
import { LocationIcon, LocationOffIcon } from './icons';

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const WMO_CODES: { [key: number]: { condition: string; icon: string } } = {
    0: { condition: 'Klarer Himmel', icon: 'sunny' },
    1: { condition: 'Leicht bewölkt', icon: 'partly_cloudy_day' },
    2: { condition: 'Teilweise bewölkt', icon: 'partly_cloudy_day' },
    3: { condition: 'Bedeckt', icon: 'cloudy' },
    45: { condition: 'Nebel', icon: 'foggy' },
    48: { condition: 'Reifnebel', icon: 'foggy' },
    51: { condition: 'Leichter Nieselregen', icon: 'rainy' },
    53: { condition: 'Mäßiger Nieselregen', icon: 'rainy' },
    55: { condition: 'Dichter Nieselregen', icon: 'rainy' },
    56: { condition: 'Leichter gefrierender Nieselregen', icon: 'rainy' },
    57: { condition: 'Dichter gefrierender Nieselregen', icon: 'rainy' },
    61: { condition: 'Leichter Regen', icon: 'rainy' },
    63: { condition: 'Mäßiger Regen', icon: 'rainy' },
    65: { condition: 'Starker Regen', icon: 'rainy' },
    66: { condition: 'Leichter gefrierender Regen', icon: 'rainy' },
    67: { condition: 'Starker gefrierender Regen', icon: 'rainy' },
    71: { condition: 'Leichter Schneefall', icon: 'weather_snowy' },
    73: { condition: 'Mäßiger Schneefall', icon: 'weather_snowy' },
    75: { condition: 'Starker Schneefall', icon: 'weather_snowy' },
    77: { condition: 'Schneekörner', icon: 'weather_snowy' },
    80: { condition: 'Leichte Regenschauer', icon: 'rainy' },
    81: { condition: 'Mäßige Regenschauer', icon: 'rainy' },
    82: { condition: 'Heftige Regenschauer', icon: 'rainy' },
    85: { condition: 'Leichte Schneeschauer', icon: 'weather_snowy' },
    86: { condition: 'Starke Schneeschauer', icon: 'weather_snowy' },
    95: { condition: 'Gewitter', icon: 'thunderstorm' },
    96: { condition: 'Gewitter mit leichtem Hagel', icon: 'thunderstorm' },
    99: { condition: 'Gewitter mit starkem Hagel', icon: 'thunderstorm' },
};

const getWeatherDetails = (code: number) => {
    return WMO_CODES[code] || { condition: 'Unbekannt', icon: 'thermostat' };
};

const WeatherIcon: React.FC<{ iconName: string, className?: string }> = ({ iconName, className }) => (
    <span className={`material-symbols-outlined ${className || ''}`}>{iconName}</span>
);

const formatDateToDay = (dateString: string, index: number) => {
    if (index === 0) return 'Heute';
    if (index === 1) return 'Morgen';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date);
};

interface WeatherData {
  location: string;
  current: {
    temp_c: number;
    condition: string;
    icon: string;
  };
  forecast: {
    day: string;
    maxtemp_c: number;
    mintemp_c: number;
    condition: string;
    icon: string;
  }[];
}


export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        if (!navigator.geolocation) {
            setError("Geolocation wird von diesem Browser nicht unterstützt.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
                    const locationApiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
                    
                    const [weatherResponse, locationResponse] = await Promise.all([
                        fetch(weatherApiUrl),
                        fetch(locationApiUrl)
                    ]);
                    
                    if (!weatherResponse.ok) throw new Error("Wetterdaten konnten nicht abgerufen werden.");
                    if (!locationResponse.ok) throw new Error("Standort konnte nicht ermittelt werden.");

                    const weatherData = await weatherResponse.json();
                    const locationData = await locationResponse.json();

                    const locationName = locationData.address.city || locationData.address.town || locationData.address.village || 'Unbekannter Ort';

                    const currentDetails = getWeatherDetails(weatherData.current.weather_code);

                    const formattedData: WeatherData = {
                        location: locationName,
                        current: {
                            temp_c: weatherData.current.temperature_2m,
                            condition: currentDetails.condition,
                            icon: currentDetails.icon,
                        },
                        forecast: weatherData.daily.time.slice(0, 3).map((date: string, index: number) => {
                            const forecastDetails = getWeatherDetails(weatherData.daily.weather_code[index]);
                            return {
                                day: date,
                                maxtemp_c: weatherData.daily.temperature_2m_max[index],
                                mintemp_c: weatherData.daily.temperature_2m_min[index],
                                condition: forecastDetails.condition,
                                icon: forecastDetails.icon,
                            }
                        })
                    };

                    setWeather(formattedData);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.");
                } finally {
                    setIsLoading(false);
                }
            },
            (geoError) => {
                switch(geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        setError("Zugriff auf den Standort verweigert.");
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        setError("Standortinformationen sind nicht verfügbar.");
                        break;
                    case geoError.TIMEOUT:
                        setError("Zeitüberschreitung bei der Standortabfrage.");
                        break;
                    default:
                        setError("Fehler bei der Standortabfrage.");
                        break;
                }
                setIsLoading(false);
            }
        );

    }, []);

    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-48">
                    <p className="text-secondary animate-pulse">Wetter wird geladen...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-48">
                    <LocationOffIcon className="w-10 h-10 text-secondary mb-3" />
                    <p className="text-primary font-semibold text-sm">Standortfehler</p>
                    <p className="text-secondary text-xs mt-1">{error}</p>
                    <button
                        onClick={fetchWeather}
                        className="mt-4 px-3 py-1.5 text-xs font-semibold rounded-md bg-surface hover:bg-border transition-colors text-primary"
                    >
                        Erneut versuchen
                    </button>
                </div>
            );
        }

        if (weather) {
            return (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <LocationIcon className="w-5 h-5 text-secondary" />
                        <h3 className="font-bold text-lg text-primary">{weather.location}</h3>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="text-accent-sky">
                            <WeatherIcon iconName={weather.current.icon} className="text-7xl" />
                        </div>
                        <div className="text-right">
                            <p className="text-6xl font-bold text-primary">{Math.round(weather.current.temp_c)}°</p>
                            <p className="text-secondary capitalize">{weather.current.condition}</p>
                        </div>
                    </div>
                    <div className="flex justify-between text-center border-t border-border pt-4">
                        {weather.forecast.map((day, index) => (
                            <div key={index} className="flex flex-col items-center gap-1 w-1/3">
                                <p className="text-sm font-semibold text-primary">{formatDateToDay(day.day, index)}</p>
                                <div className="text-secondary my-1">
                                    <WeatherIcon iconName={day.icon} className="text-2xl" />
                                </div>
                                <p className="text-sm text-secondary">
                                    <span className="font-medium text-primary">{Math.round(day.maxtemp_c)}°</span> / {Math.round(day.mintemp_c)}°
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="bg-surface-light p-6 rounded-2xl shadow-lg">
             {renderContent()}
        </div>
    );
};