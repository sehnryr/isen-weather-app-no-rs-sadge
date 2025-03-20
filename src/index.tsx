import React, { useState } from "react";
import ReactDOM from "react-dom/client";

interface Weather {
  id: number;
  city: string;
  country: string;
  temperature: number;
  weather_description: string;
  humidity: number;
  wind_speed: number;
}

function WeatherApp(): React.ReactElement {
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (): Promise<void> => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/weathers?search=${city}`);
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error("City not found");
      }
      setWeather(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Weather</h1>
      
      <div>
        <input
          type="text"
          value={city}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              fetchWeather();
            }
          }}
          placeholder="Enter a city name"
        />
        <button
          onClick={fetchWeather}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && (
        <div>
          {error}
        </div>
      )}

      {weather && (
        <div>
          <h2>{weather.city}, {weather.country}</h2>
          <div>{weather.temperature}°C</div>
          <div>{weather.weather_description}</div>
          <div>Humidity: {weather.humidity}%</div>
          <div>Wind: {weather.wind_speed} km/h</div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<WeatherApp />);
