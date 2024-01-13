import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
const API_URL = "http://api.openweathermap.org";
const API_KEY = "ecdf4bfb03da691940e81391a70423f1";
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const city = req.query.city;
  if (city) {
    try {
      const result = await axios.get(
        `${API_URL}/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      res.render("index", { weather: result.data });
      console.log(result.data);
    } catch (error) {
      console.error(error.response || error);
      res.render("index", { weather: null });
    }
  } else {
    res.render("index", { weather: null });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
