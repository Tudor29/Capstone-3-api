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
  let city = req.query.city;
  const { lat, lon } = req.query;

  if (lat && lon) {
    try {
      const weatherResponse = await axios.get(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`
      );
      res.render("index", {
        weatherData: weatherResponse.data,
        city: "Your Current Location",
        getHourlyForecastDay,
        getFormattedDailyDate,
      });
    } catch (error) {
      console.error(error.response || error);
      res.render("index", { weatherData: null, city: null });
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
        res.render("index", {
          weatherData: weatherResponse.data,
          city: city,
          getHourlyForecastDay,
          getFormattedDailyDate,
        });
      } else {
        res.render("index", { weatherData: null, city: null });
      }
    } catch (error) {
      console.error(error.response || error);
      res.render("index", { weatherData: null, city: null });
    }
  } else {
    res.render("index", { weatherData: null, city: null });
  }
});

function capitalize(str) {
  if (str && typeof str === 'string') {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
