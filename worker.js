export default {
  async fetch(request) {

    const url = new URL(request.url);

    // =====================================================
    // CORS
    // =====================================================

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // =====================================================
    // OPTIONS
    // =====================================================

    if (request.method === "OPTIONS") {

      return new Response(null, {
        headers: corsHeaders
      });

    }

    // =====================================================
    // WEATHER API
    // =====================================================

    if (url.pathname === "/api/weather") {

      try {

        // =================================================
        // LOCATION
        // =================================================

        const latitude = 25.2138;
        const longitude = 75.8648;

        // =================================================
        // OPEN-METEO URL
        // =================================================

        const apiURL =
          "https://api.open-meteo.com/v1/forecast" +

          "?latitude=" + latitude +

          "&longitude=" + longitude +

          "&current=" +

          "temperature_2m," +
          "relative_humidity_2m," +
          "apparent_temperature," +
          "dew_point_2m," +
          "precipitation," +
          "rain," +
          "showers," +
          "snowfall," +
          "weather_code," +
          "cloud_cover," +
          "pressure_msl," +
          "surface_pressure," +
          "visibility," +
          "wind_speed_10m," +
          "wind_direction_10m," +
          "wind_gusts_10m," +
          "uv_index," +
          "precipitation_probability," +
          "is_day" +

          "&daily=" +

          "sunrise," +
          "sunset," +
          "temperature_2m_max," +
          "temperature_2m_min," +
          "uv_index_max," +
          "precipitation_sum," +
          "rain_sum," +
          "showers_sum," +
          "snowfall_sum," +
          "precipitation_probability_max" +

          "&timezone=auto";

        // =================================================
        // FETCH WEATHER
        // =================================================

        const response =
          await fetch(apiURL);

        if (!response.ok) {

          return new Response(
            JSON.stringify({
              error: "Weather provider failed"
            }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                "Content-Type":
                  "application/json"
              }
            }
          );

        }

        const data =
          await response.json();

        const current =
          data.current;

        const daily =
          data.daily;

        // =================================================
        // WEATHER CONDITION
        // =================================================

        const code =
          current.weather_code;

        let condition =
          "Unknown";

        if (code === 0) {

          condition = "Clear";

        } else if (
          code === 1 ||
          code === 2
        ) {

          condition = "Partly Cloudy";

        } else if (
          code === 3
        ) {

          condition = "Overcast";

        } else if (
          code === 45 ||
          code === 48
        ) {

          condition = "Fog";

        } else if (
          code >= 51 &&
          code <= 57
        ) {

          condition = "Drizzle";

        } else if (
          code >= 61 &&
          code <= 67
        ) {

          condition = "Rain";

        } else if (
          code >= 71 &&
          code <= 77
        ) {

          condition = "Snow";

        } else if (
          code >= 80 &&
          code <= 82
        ) {

          condition = "Rain Showers";

        } else if (
          code >= 85 &&
          code <= 86
        ) {

          condition = "Snow Showers";

        } else if (
          code === 95
        ) {

          condition = "Thunderstorm";

        } else if (
          code === 96 ||
          code === 99
        ) {

          condition =
            "Thunderstorm + Hail";
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
            Math.round(
              windDegree / 45
            ) % 8
          ];

        // =================================================
        // DAY / NIGHT
        // =================================================

        const dayNight =
          current.is_day === 1
            ? "Day"
            : "Night";

        // =================================================
        // FINAL DATA
        // =================================================

        const result = {

          // -----------------------------
          // CURRENT WEATHER
          // -----------------------------

          temperature:
            current.temperature_2m,

          feels_like:
            current.apparent_temperature,

          humidity:
            current.relative_humidity_2m,

          dew_point:
            current.dew_point_2m,

          // -----------------------------
          // WIND
          // -----------------------------

          wind:
            current.wind_speed_10m,

          wind_direction:
            windDirection,

          wind_degree:
            current.wind_direction_10m,

          wind_gust:
            current.wind_gusts_10m,

          // -----------------------------
          // ATMOSPHERE
          // -----------------------------

          pressure:
            current.surface_pressure,

          pressure_msl:
            current.pressure_msl,

          cloud_cover:
            current.cloud_cover,

          visibility:
            current.visibility,

          // -----------------------------
          // RAIN
          // -----------------------------

          precipitation:
            current.precipitation,

          rain:
            current.rain,

          showers:
            current.showers,

          snowfall:
            current.snowfall,

          rain_probability:
            current.precipitation_probability,

          // -----------------------------
          // UV
          // -----------------------------

          uv:
            current.uv_index,

          // -----------------------------
          // CONDITION
          // -----------------------------

          condition:
            condition,

          weather_code:
            code,

          day_night:
            dayNight,

          // -----------------------------
          // TODAY
          // -----------------------------

          sunrise:
            daily.sunrise[0],

          sunset:
            daily.sunset[0],

          today_max:
            daily.temperature_2m_max[0],

          today_min:
            daily.temperature_2m_min[0],

          today_uv_max:
            daily.uv_index_max[0],

          today_rain:
            daily.rain_sum[0],

          today_precipitation:
            daily.precipitation_sum[0],

          today_showers:
            daily.showers_sum[0],

          today_snow:
            daily.snowfall_sum[0],

          today_rain_probability:
            daily.precipitation_probability_max[0],

          // -----------------------------
          // SYSTEM
          // -----------------------------

          location:
            "Kota, Rajasthan, India",

          latitude:
            latitude,

          longitude:
            longitude,

          timezone:
            data.timezone,

          updated:
            current.time

        };

        // =================================================
        // RESPONSE
        // =================================================

        return new Response(
          JSON.stringify(
            result,
            null,
            2
          ),
          {
            headers: {
              ...corsHeaders,

              "Content-Type":
                "application/json",

              "Cache-Control":
                "no-cache, no-store"
            }
          }
        );

      } catch (error) {

        return new Response(
          JSON.stringify({
            error:
              error.toString()
          }),
          {
            status: 500,

            headers: {
              ...corsHeaders,

              "Content-Type":
                "application/json"
            }
          }
        );

      }

    }

    // =====================================================
    // API INFO
    // =====================================================

    if (url.pathname === "/api") {

      return new Response(
        JSON.stringify({
          name: "Happy Weather API",
          status: "online",
          endpoint: "/api/weather",
          update: "live"
        }, null, 2),
        {
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json"
          }
        }
      );

    }

    // =====================================================
    // DEFAULT
    // =====================================================

    return new Response(
      "Happy Weather Server is Online!",
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "text/plain"
        }
      }
    );

  }
};
