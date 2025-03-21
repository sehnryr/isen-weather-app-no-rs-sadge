import React, { useEffect, useState } from "react";
import { Weather } from "../types/weather";
import { getSimpleOutfitTip, reverseGeocode } from "../utils/weather";
import { isDarkMode, getThemeStyles } from "../utils/theme";

export function WeatherApp(): React.ReactElement {
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(isDarkMode());

  useEffect(() => {
    // Update dark mode when system preference changes
    const darkModeQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const updateDarkMode = () => setDarkMode(isDarkMode());
    darkModeQuery.addListener(updateDarkMode);

    // Update dark mode every minute to check for time changes
    const timeInterval = setInterval(updateDarkMode, 60000);

    return () => {
      darkModeQuery.removeListener(updateDarkMode);
      clearInterval(timeInterval);
    };
  }, []);

  const styles = getThemeStyles(darkMode);

  const fetchWeatherByCoords = async (
    latitude: number,
    longitude: number,
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // First, get the city name from coordinates using reverse geocoding
      const cityName = await reverseGeocode(latitude, longitude);

      // Then fetch weather using the city name
      const response = await fetch(`/api/v1/weathers?search=${cityName}`);
      if (!response.ok) {
        throw new Error("Weather data not found");
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error("Weather data not found");
      }
      setWeather(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

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

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (_err) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Weather</h1>

      <div>
        <input
          type="text"
          value={city}
          style={styles.input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCity(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              fetchWeather();
            }
          }}
          placeholder="Enter a city name"
        />
        <button
          type="button"
          style={styles.button}
          onClick={fetchWeather}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
        <button
          type="button"
          style={styles.button}
          onClick={getLocation}
          disabled={loading}
        >
          Use My Location
        </button>
      </div>

      {error && (
        <div style={styles.error}>
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
          <div>
            {(() => {
              const tips = getSimpleOutfitTip(weather);
              return tips.length > 0
                ? (
                  <div>
                    <h3>Tips:</h3>
                    <ul>
                      {tips.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                  </div>
                )
                : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
