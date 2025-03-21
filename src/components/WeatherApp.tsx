import React, { useEffect, useState } from "react";
import { Weather } from "../types/weather";
import { getSimpleOutfitTip, reverseGeocode } from "../utils/weather";
import { isDarkMode, getThemeStyles, applyThemeToBody } from "../utils/theme";
import { saveWeatherData, getCachedWeatherData, isOffline } from "../utils/storage";

export function WeatherApp(): React.ReactElement {
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(isDarkMode());
  const [offline, setOffline] = useState<boolean>(isOffline());

  useEffect(() => {
    // Update dark mode when system preference changes
    const darkModeQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const updateDarkMode = () => {
      const newDarkMode = isDarkMode();
      setDarkMode(newDarkMode);
      applyThemeToBody(newDarkMode);
    };
    darkModeQuery.addEventListener("change", updateDarkMode);

    // Update dark mode every minute to check for time changes
    const timeInterval = setInterval(updateDarkMode, 60000);

    // Apply theme immediately
    applyThemeToBody(darkMode);

    return () => {
      darkModeQuery.removeEventListener("change", updateDarkMode);
      clearInterval(timeInterval);
    };
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setOffline(isOffline());
    };

    globalThis.addEventListener("online", handleOnlineStatusChange);
    globalThis.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      globalThis.removeEventListener("online", handleOnlineStatusChange);
      globalThis.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  // Load cached data on initial load
  useEffect(() => {
    const cachedData = getCachedWeatherData();
    if (cachedData) {
      setWeather(cachedData);
      setCity(cachedData.city);
    }
  }, []);

  const styles = getThemeStyles(darkMode);

  const fetchWeatherByCoords = async (
    latitude: number,
    longitude: number,
  ): Promise<void> => {
    if (offline) {
      const cachedData = getCachedWeatherData();
      if (cachedData) {
        setWeather(cachedData);
        setError("You are offline. Showing cached data.");
      } else {
        setError("You are offline and no cached data is available.");
      }
      setLoading(false);
      return;
    }

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
      const weatherData = data[0];
      setWeather(weatherData);
      
      // Save to localStorage for offline access
      saveWeatherData(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (): Promise<void> => {
    if (!city.trim()) return;

    if (offline) {
      const cachedData = getCachedWeatherData(city);
      if (cachedData) {
        setWeather(cachedData);
        setError("You are offline. Showing cached data.");
      } else {
        setError("You are offline and no cached data is available for this city.");
      }
      return;
    }

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
      const weatherData = data[0];
      setWeather(weatherData);
      
      // Save to localStorage for offline access
      saveWeatherData(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Get location on initial load
  useEffect(() => {
    // Get location on component mount
    if (navigator.geolocation) {
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
    }
  }, []);

  return (
    <div>
      <h1>Weather</h1>

      {offline && (
        <div style={styles.error}>
          Offline Mode - Using cached data
        </div>
      )}

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
