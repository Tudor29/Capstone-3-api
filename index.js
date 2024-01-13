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

app.get("/", async (req, res) => {
  const city = req.query.city;

  if (city) {
    try {
      const geoResponse = await axios.get(
        `${GEO_API_URL}?q=${city}&limit=1&appid=${API_KEY}`
      );
      const { lat, lon } = geoResponse.data[0];
      const weatherResponse = await axios.get(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`
      );
      res.render("index", { weather: weatherResponse.data, city: city });
    } catch (error) {
      console.error(error.response || error);
      res.render("index", { weather: null, city: null });
    }
  } else {
    res.render("index", { weather: null, city: null });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
