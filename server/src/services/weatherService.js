
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const getWeatherForecast = async (city) => {
  if (!city || typeof city !== "string" || !city.trim()) {
    throw new Error("A valid branch city is required.");
  }

  try {
    const locationUrl = new URL(GEOCODING_URL);

    locationUrl.searchParams.set("name", city.trim());
    locationUrl.searchParams.set("count", "5");
    locationUrl.searchParams.set("language", "en");
    locationUrl.searchParams.set("format", "json");

    const locationResponse = await fetchWithTimeout(locationUrl);

    if (!locationResponse.ok) {
      throw new Error("Unable to fetch city location.");
    }

    const locationData = await locationResponse.json();
    const locations = locationData.results || [];

    if (locations.length === 0) {
      throw new Error(`Weather location not found for city: ${city}`);
    }

    // Prefer an Indian match when one exists.
    const location =
      locations.find((item) => item.country_code === "IN") ||
      locations[0];

    const weatherUrl = new URL(WEATHER_URL);

    weatherUrl.searchParams.set("latitude", location.latitude);
    weatherUrl.searchParams.set("longitude", location.longitude);

    weatherUrl.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code"
    );

    weatherUrl.searchParams.set("forecast_days", "7");
    weatherUrl.searchParams.set("timezone", "auto");

    const weatherResponse = await fetchWithTimeout(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Unable to fetch weather forecast.");
    }

    const weatherData = await weatherResponse.json();
    const daily = weatherData.daily;

    if (!daily || !Array.isArray(daily.time)) {
      throw new Error("Weather forecast data is unavailable.");
    }

    const forecast = daily.time.map((date, index) => ({
      date,
      temperatureMax: daily.temperature_2m_max?.[index] ?? null,
      temperatureMin: daily.temperature_2m_min?.[index] ?? null,
      rainfall: daily.precipitation_sum?.[index] ?? null,
      weatherCode: daily.weather_code?.[index] ?? null,
    }));

    return {
      city: location.name,
      country: location.country || null,
      countryCode: location.country_code || null,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: weatherData.timezone,
      source: "Open-Meteo",
      forecast,
    };
  } catch (error) {
    console.error("Weather Service Error:", error.message);
    throw error;
  }
};
