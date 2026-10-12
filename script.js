
const unitToggle = document.getElementById("unit-toggle");

let isFahrenheit = false;
let latestWeather = null;
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weather-result");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const forecastGrid = document.getElementById("forecast");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Loading weather...";
    weatherResult.hidden = true;

    try {
        // Find the city's coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            message.textContent = "City not found. Try another name.";
            return;
        }

        const place = geoData.results[0];

        // Get current weather for that location
        const weatherResponse = await fetch(
        
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather data.");
        }

        const weatherData = await weatherResponse.json();
        latestWeather = weatherData;

        const current = weatherData.current;

        // Convert weather codes into readable descriptions
        const weatherDescriptions = {
            0: "Clear sky ☀️",
            1: "Mainly clear 🌤️",
            2: "Partly cloudy ⛅",
            3: "Overcast ☁️",
            45: "Foggy 🌫️",
            48: "Foggy 🌫️",
            51: "Light drizzle 🌦️",
            53: "Drizzle 🌦️",
            55: "Heavy drizzle 🌧️",
            61: "Light rain 🌧️",
            63: "Moderate rain 🌧️",
            65: "Heavy rain 🌧️",
            71: "Light snow 🌨️",
            73: "Moderate snow 🌨️",
            75: "Heavy snow ❄️",
            80: "Rain showers 🌦️",
            81: "Rain showers 🌧️",
            82: "Heavy rain showers 🌧️",
            95: "Thunderstorm ⛈️",
            96: "Thunderstorm with hail ⛈️",
            99: "Thunderstorm with hail ⛈️"
        };

        cityName.textContent = `${place.name}, ${place.country}`;
        temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
        condition.textContent =
            weatherDescriptions[current.weather_code] || "Weather conditions unavailable";
        humidity.textContent =
            `Humidity: ${current.relative_humidity_2m}%`;
        wind.textContent =
            `Wind speed: ${current.wind_speed_10m} km/h`;
            
forecastGrid.innerHTML = "";

for (let i = 0; i < weatherData.daily.time.length; i++) {
    const date = new Date(
        weatherData.daily.time[i] + "T12:00:00"
    );
    updateTemperatures();

    const day = date.toLocaleDateString("en-US", {
        weekday: "short"
    });

    const code = weatherData.daily.weather_code[i];

    const description =
        weatherDescriptions[code] || "Conditions unavailable";

    const maxTemp = weatherData.daily.temperature_2m_max[i];
    const minTemp = weatherData.daily.temperature_2m_min[i];

    const card = document.createElement("div");
    card.className = "forecast-card";

    const heading = document.createElement("h4");
    heading.textContent = day;

    const conditionText = document.createElement("p");
    conditionText.textContent = description;

    const tempText = document.createElement("p");
    tempText.className = "forecast-temp";
    tempText.textContent =
        `${Math.round(maxTemp)}° / ${Math.round(minTemp)}°C`;

    card.append(heading, conditionText, tempText);
    forecastGrid.appendChild(card);
}

        message.textContent = "Here is your current weather:";
        weatherResult.hidden = false;

    } catch (error) {
        message.textContent =
            "Something went wrong. Check your internet connection and try again.";
        console.error(error);
    }
});

function convertTemperature(celsius) {
    return isFahrenheit
        ? (celsius * 9 / 5) + 32
        : celsius;
}

function updateTemperatures() {
    if (!latestWeather) return;

    const current = latestWeather.current;

    temperature.textContent =
        `${Math.round(convertTemperature(current.temperature_2m))}°${isFahrenheit ? "F" : "C"}`;

    forecastGrid.querySelectorAll(".forecast-card").forEach((card, index) => {
        const max = latestWeather.daily.temperature_2m_max[index];
        const min = latestWeather.daily.temperature_2m_min[index];

        const tempText = card.querySelector(".forecast-temp");

        tempText.textContent =
            `${Math.round(convertTemperature(max))}° / ${Math.round(convertTemperature(min))}°${isFahrenheit ? "F" : "C"}`;
    });

    unitToggle.textContent = isFahrenheit
        ? "Switch to °C"
        : "Switch to °F";
}

unitToggle.addEventListener("click", function () {
    isFahrenheit = !isFahrenheit;
    updateTemperatures();
});