import { Weather } from "../types/weather";
import { GeocodeResponse } from "../types/geocode";
import { getGeocodingUrl } from "./environment";

export function getSimpleOutfitTip(weather: Weather): string[] {
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

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const geocodingUrl = getGeocodingUrl();
  const response = await fetch(
    `${geocodingUrl}?format=json&lat=${latitude}&lon=${longitude}`,
  );
  if (!response.ok) {
    throw new Error("Unable to get location name");
  }
  const data: GeocodeResponse = await response.json();
  const cityName = data.address?.city;
  if (!cityName) {
    throw new Error("Unable to determine your city");
  }
  return cityName;
}
