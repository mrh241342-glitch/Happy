export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // =================================================
    // WEATHER API
    // =================================================

    if (url.pathname === "/api/weather") {

      try {

        const latitude = 25.2138;
        const longitude = 75.8648;

        const apiURL =
          "https://api.open-meteo.com/v1/forecast" +
          "?latitude=" + latitude +
          "&longitude=" + longitude +
          "&current=" +
          "temperature_2m," +
          "relative_humidity_2m," +
          "apparent_temperature," +
          "precipitation," +
          "weather_code," +
          "surface_pressure," +
          "wind_speed_10m," +
          "wind_direction_10m" +
          "&hourly=" +
          "visibility," +
          "uv_index," +
          "precipitation_probability" +
          "&timezone=auto";

        const response = await fetch(apiURL);

        if (!response.ok) {
          return jsonResponse({
            error: "Weather API failed",
            status: response.status
          }, 500);
        }

        const data = await response.json();

        const current = data.current;
        const hourly = data.hourly;

        // =================================================
        // CONDITION
        // =================================================

        const code = current.weather_code;

        let condition = "Unknown";

        if (code === 0) {
          condition = "Clear";
        }
        else if (code === 1 || code === 2) {
          condition = "Cloudy";
        }
        else if (code === 3) {
          condition = "Overcast";
        }
        else if (code === 45 || code === 48) {
          condition = "Fog";
        }
        else if (code >= 51 && code <= 55) {
          condition = "Drizzle";
        }
        else if (code >= 61 && code <= 65) {
          condition = "Rain";
        }
        else if (code >= 71 && code <= 77) {
          condition = "Snow";
        }
        else if (code >= 80 && code <= 82) {
          condition = "Showers";
        }
        else if (code >= 95) {
          condition = "Storm";
        }

        // =================================================
        // WIND DIRECTION
        // =================================================

        const directions = [
          "N",
          "NE",
          "E",
          "SE",
          "S",
          "SW",
          "W",
          "NW"
        ];

        const windDegree =
          current.wind_direction_10m;

        const windDirection =
          directions[
            Math.round(windDegree / 45) % 8
          ];

        // =================================================
        // RESULT
        // =================================================

        const result = {

          temperature:
            current.temperature_2m,

          feels_like:
            current.apparent_temperature,

          humidity:
            current.relative_humidity_2m,

          wind:
            current.wind_speed_10m,

          wind_direction:
            windDirection,

          pressure:
            current.surface_pressure,

          rain:
            hourly.precipitation_probability[0],

          precipitation:
            current.precipitation,

          visibility:
            hourly.visibility[0],

          uv:
            hourly.uv_index[0],

          condition:
            condition,

          weather_code:
            code,

          updated:
            current.time,

          location:
            "Kota, Rajasthan, India"
        };

        return jsonResponse(
          result,
          200
        );

      }
      catch (error) {

        return jsonResponse({
          error: error.toString()
        }, 500);
      }
    }

    // =================================================
    // NORMAL WEBSITE
    // =================================================

    return env.ASSETS.fetch(request);
  }
};


// =====================================================
// JSON RESPONSE
// =====================================================

function jsonResponse(data, status = 200) {

  return new Response(
    JSON.stringify(data, null, 2),
    {
      status: status,

      headers: {
        "Content-Type":
          "application/json",

        "Access-Control-Allow-Origin":
          "*",

        "Cache-Control":
          "no-cache"
      }
    }
  );
}
