import { Weather } from "../types/weather";

const WEATHER_CACHE_PREFIX = "weather_cache_";

export function saveWeatherData(weather: Weather): void {
  try {
    // Use city name as the key to store different cities
    const storageKey = `${WEATHER_CACHE_PREFIX}${weather.city.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(weather));
  } catch (error) {
    console.error("Failed to save weather data to localStorage:", error);
  }
}

export function getCachedWeatherData(city?: string): Weather | null {
  try {
    if (city) {
      // If a specific city is requested, return just that city's data
      const storageKey = `${WEATHER_CACHE_PREFIX}${city.toLowerCase()}`;
      const weatherData = localStorage.getItem(storageKey);
      
      if (!weatherData) {
        return null;
      }
      
      return JSON.parse(weatherData) as Weather;
    } else {
      // If no specific city is requested, return the first cached city found
      // This is useful for initial load
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(WEATHER_CACHE_PREFIX)) {
          const weatherData = localStorage.getItem(key);
          if (weatherData) {
            return JSON.parse(weatherData) as Weather;
          }
        }
      }
      return null;
    }
  } catch (error) {
    console.error("Failed to retrieve weather data from localStorage:", error);
    return null;
  }
}

export function getAllCachedCities(): Weather[] {
  const cities: Weather[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(WEATHER_CACHE_PREFIX)) {
        const weatherData = localStorage.getItem(key);
        if (weatherData) {
          cities.push(JSON.parse(weatherData) as Weather);
        }
      }
    }
  } catch (error) {
    console.error("Failed to retrieve all cached cities:", error);
  }
  
  return cities;
}

export function isOffline(): boolean {
  return !navigator.onLine;
}
