import React, { useEffect, useState } from "react";
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

function getSimpleOutfitTip(weather: Weather): string[] {
  const tips: string[] = [];

  // Temperature-based tips
  if (weather.temperature <= 15) {
    tips.push("Wear a coat");
  }

  // Weather condition tips
  const description = weather.weather_description.toLowerCase();
  if (description.includes("rain") || description.includes("shower")) {
    tips.push("Bring an umbrella");
  }

  return tips;
}

function isDarkMode(): boolean {
  // Check system preference
  if (
    globalThis.matchMedia &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return true;
  }

  // Check time of day (dark mode between 6 PM and 6 AM)
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
}

function WeatherApp(): React.ReactElement {
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

  const styles = {
    container: {
      backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
      color: darkMode ? "#ffffff" : "#000000",
      minHeight: "100vh",
      padding: "20px",
    },
    input: {
      backgroundColor: darkMode ? "#333" : "#fff",
      color: darkMode ? "#fff" : "#000",
      border: `1px solid ${darkMode ? "#666" : "#ccc"}`,
      padding: "8px",
      borderRadius: "4px",
    },
    button: {
      backgroundColor: darkMode ? "#444" : "#f0f0f0",
      color: darkMode ? "#fff" : "#000",
      border: "none",
      padding: "8px 16px",
      margin: "0 4px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    error: {
      color: darkMode ? "#ff6b6b" : "#dc3545",
      marginTop: "10px",
    },
  };

  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<string> => {
    const response = await fetch(
      `/geo/reverse?format=json&lat=${latitude}&lon=${longitude}`,
    );
    if (!response.ok) {
      throw new Error("Unable to get location name");
    }
    const data = await response.json();
    const cityName = data.address?.city;
    if (!cityName) {
      throw new Error("Unable to determine your city");
    }
    return cityName;
  };

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
    getLocation(); // Ask for location when component mounts
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

ReactDOM.createRoot(document.getElementById("root")!).render(<WeatherApp />);
