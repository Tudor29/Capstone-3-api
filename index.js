import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_API_URL = "https://api.openweathermap.org/data/3.0/onecall";
const API_KEY = "a7acbb3e48177f801a9ef5fa2b8ffeb0";
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

function getHourlyForecastDay(timestamp) {
  const date = new Date(timestamp * 1000);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return (
    days[date.getDay()] +
    " " +
    date.toLocaleTimeString([], { hour: "numeric", minute: "numeric" })
  );
}

function getFormattedDailyDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${date.toDateString().substr(0, 3)}, ${day}.${month}`;
}

app.get("/", async (req, res) => {
  let { city, lat, lon } = req.query;
  let weatherData = null;
  let iconUrl = null;
  let backgroundImage = null;

  if (lat && lon) {
    try {
      const weatherResponse = await axios.get(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`
      );
      weatherData = weatherResponse.data;
      city = "Your Current Location";
    } catch (error) {
      console.error(error.response || error);
    }
  } else if (city) {
    city = capitalize(city);
    try {
      const geoResponse = await axios.get(
        `${GEO_API_URL}?q=${city}&limit=1&appid=${API_KEY}`
      );
      if (geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        const weatherResponse = await axios.get(
          `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`
        );
        weatherData = weatherResponse.data;
      }
    } catch (error) {
      console.error(error.response || error);
    }
  }

  if (
    weatherData &&
    weatherData.current &&
    weatherData.current.weather &&
    weatherData.current.weather.length > 0
  ) {
    iconUrl = getWeatherIconUrl(weatherData.current.weather[0].icon);
    backgroundImage = `url('${getBackgroundImage(
      weatherData.current.weather[0].icon
    )}')`;
  }

  res.render("index", {
    weatherData: weatherData,
    city: city,
    iconUrl: iconUrl,
    backgroundImage: backgroundImage,
    getHourlyForecastDay,
    getFormattedDailyDate,
  });
});

function capitalize(str) {
  if (str && typeof str === "string") {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
}

function getWeatherIconUrl(iconCode) {
  return `http://openweathermap.org/img/wn/${iconCode}.png`;
}

function getBackgroundImage(iconCode) {
  const isDay = iconCode.endsWith("d");
  switch (iconCode) {
    case "01d":
    case "01n":
      return "./images/clear_sky.jpg";
    case "02d":
    case "02n":
      return "./images/cloudy.jpg";
    case "03d":
    case "03n":
      return "./images/cloudy.jpg";
    case "04d":
    case "04n":
      return "./images/cloudy.jpg";
    case "09d":
    case "09n":
      return "./images/rain.jpg";
    case "10d":
    case "10n":
      return "./images/rain.jpg";
    case "11d":
    case "11n":
      return "./images/thunderstorm.jpg";
    case "13d":
    case "13n":
      return "./images/snow.jpg";
    case "50d":
    case "50n":
      return "./images/mist.jpg";
    default:
      return "./images/default.png";
  }
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
