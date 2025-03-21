/**
 * Check if the app is running in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * Get the base API URL for weather data
 */
export const getWeatherApiUrl = (): string => {
  return isProduction()
    ? "https://freetestapi.com/api/v1/weathers"
    : "/api/v1/weathers";
};

/**
 * Get the base URL for geocoding
 */
export const getGeocodingUrl = (): string => {
  return isProduction()
    ? "https://nominatim.openstreetmap.org/reverse"
    : "/geo/reverse";
};
