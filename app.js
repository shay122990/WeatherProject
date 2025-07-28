const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/", (req, res) => {
  const query = req.body.cityName;
  const apiKey = "PUBLIC_KEY";
  const units = "metric";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}`;

  https
    .get(url, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        const weatherData = JSON.parse(data);

        if (response.statusCode !== 200 || !weatherData.main) {
          return res.send(`
          <h1>Error: ${weatherData.message || "Could not fetch weather"}</h1>
          <a href="/">Try another city</a>
        `);
        }

        const temp = weatherData.main.temp;
        const description = weatherData.weather[0].description;
        const icon = weatherData.weather[0].icon;
        const imageURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

        res.send(`
        <h1>Weather in ${query}</h1>
        <p>${description}</p>
        <p>${temp}°C</p>
        <img src="${imageURL}" alt="Weather icon" />
        <br /><a href="/">Search again</a>
      `);
      });
    })
    .on("error", (err) => {
      res.send(`
      <h1>Network error: ${err.message}</h1>
      <a href="/">Try again</a>
    `);
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
