import { updateConfig, getConfig } from "../config/configManager.js";
import { emit } from "../js/eventbus.js";

/**
 * Keys for localStorage cache
 */
const CACHE_KEYS = {
    GEO: "geoData",
    WEATHER: "weatherData",
    AIR: "airData"
};

const CACHE_TTL = {
    WEATHER: 10 * 60 * 1000, // 10 minutes
    AIR: 15 * 60 * 1000     // 15 minutes
};

/**
 * Helper: Save to cache
 */
function saveCache(key, data) {
    const timestamp = Date.now();
    localStorage.setItem(key, JSON.stringify({ data, timestamp }));
}

/**
 * Helper: Load from cache
 */
function loadCache(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        return {
            ...parsed,
            age: Date.now() - parsed.timestamp
        };
    } catch {
        return null;
    }
}

/**
 * Step 1: Geocoding
 * Only runs if location changed
 */
export async function fetchGeoLocation(cityName) {
    // Check cache first
    console.log("function fetchGeoLocationData")
    const cache = loadCache(CACHE_KEYS.GEO);
    const currentCity = getConfig()?.userProfile.location || "";
    if (cache?.data?.city === cityName) {
        return cache.data;
    }

    const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
    );

    const json = await res.json();
    if (!json.results || json.results.length === 0) {
        throw new Error("Location not found");
    }

    const { latitude, longitude, name } = json.results[0];

    const geoData = { latitude, longitude, city: name };

    // Save to cache
    saveCache(CACHE_KEYS.GEO, geoData);

    // Update global config
    updateConfig({ location: name });

    console.log("function fetchGeoLocationData at return")
    return geoData;
}

/**
 * Step 2: Weather API
 */
export async function fetchWeather(latitude, longitude) {
    console.log("function fetchWeatherData");

    const cache = loadCache(CACHE_KEYS.WEATHER);

    if (
        cache &&
        cache.data.latitude === latitude &&
        cache.data.longitude === longitude &&
        cache.age < CACHE_TTL.WEATHER
    ) {
        console.log("Using cached weather data");
        return cache.data;
    }

    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current_weather=true` +
        `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,uv_index` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&timezone=Asia/Shanghai`
    );

    const json = await res.json();

    const weatherData = {
        latitude,
        longitude,
        fetchedAt: new Date().toISOString(),
        current: json.current_weather,
        hourly: json.hourly,
        daily: json.daily
    };

    saveCache(CACHE_KEYS.WEATHER, weatherData);

    console.log("function fetchWeatherData at fetch return");
    return weatherData;
}

/**
 * Step 3: Air Quality API
 */
export async function fetchAirQuality(latitude, longitude) {
    console.log("function fetchAirQualityData");

    const cache = loadCache(CACHE_KEYS.AIR);

    if (
        cache &&
        cache.data.latitude === latitude &&
        cache.data.longitude === longitude &&
        cache.age < CACHE_TTL.AIR
    ) {
        console.log("Using cached air quality data");
        return cache.data;
    }

    const res = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&hourly=pm2_5,pm10,us_aqi` +
        `&timezone=Asia/Shanghai`
    );

    const json = await res.json();

    const airData = {
        latitude,
        longitude,
        fetchedAt: new Date().toISOString(),
        hourly: json.hourly,
        currentPM25: json.hourly.pm2_5?.[0] ?? null
    };

    saveCache(CACHE_KEYS.AIR, airData);

    console.log("function fetchAirQualityData at return");
    return airData;
}

/**
 * Load network data and emit to event bus
 * @param {string} cityname - City name
 */
export async function loadNetwork(cityname) {
    const networkData =  await initNetwork(cityname)
    emit("network:data", networkData)
}

/**
 * Main entry point for network data
 * @param {string} cityName - City to fetch data for
 * @returns {Promise<Object>} Combined geo, weather, and air data
 */
export async function initNetwork(cityName) {
    console.log("function initNerwork run")
    const geo = await fetchGeoLocation(cityName);
    const weather = await fetchWeather(geo.latitude, geo.longitude);
    const air = await fetchAirQuality(geo.latitude, geo.longitude);


    console.log("function initNetwork at return")
    return { geo, weather, air };
}

