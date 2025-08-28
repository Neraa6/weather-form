import React, { useState, useEffect } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import useToggle from "./hooks/useToggle";
import useWindowSize from "./hooks/useWindowSize";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [city, setCity] = useLocalStorage("lastCity", "Jakarta");
  const [unit, toggleUnit] = useToggle(true); 
  const { width } = useWindowSize();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError("");

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country,
        current: weatherData.current_weather,
        daily: weatherData.daily,
      });
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    const inputCity = e.target.city.value;
    if (inputCity) setCity(inputCity);
  };


  const convertTemp = (tempC) =>
    unit ? `${tempC}°C` : `${(tempC * 1.8 + 32).toFixed(1)}°F`;

  return (
    <div className="app d-flex justify-content-center align-items-center vh-100">
      <div className="weather-card p-4 rounded-4 shadow-lg text-white text-center">
        <h2 className="fw-bold mb-3">🌤 Weather Forecast</h2>

       
        <form className="d-flex mb-3" onSubmit={handleSearch}>
          <input
            type="text"
            name="city"
            className="form-control me-2"
            placeholder="Enter city..."
          />
          <button className="btn btn-warning fw-bold">Search</button>
        </form>

        {loading && <p>⏳ Loading...</p>}
        {error && <p className="text-danger">❌ {error}</p>}

     
        {weather && (
          <>
            <h3 className="mb-0">
              {weather.city}, {weather.country}
            </h3>
            <p className="display-4 fw-bold">
              {convertTemp(weather.current.temperature)}
            </p>
            <p className="lead">💨 {weather.current.windspeed} km/h wind</p>

            <button
              className="btn btn-outline-light mt-2"
              onClick={toggleUnit}
            >
              Switch to {unit ? "°F" : "°C"}
            </button>

        
            <div className="forecast mt-4">
              <h5 className="mb-3">7-Day Forecast</h5>
              <div className="row g-2">
                {weather.daily.time.map((date, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="card bg-transparent border-light text-white p-2">
                      <small>{date}</small>
                      <p className="mb-1">
                        ⬆ {convertTemp(weather.daily.temperature_2m_max[i])}
                      </p>
                      <p className="mb-0">
                        ⬇ {convertTemp(weather.daily.temperature_2m_min[i])}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-4 small text-light">
          <p>📏 Window Size: {width}px</p>
        </div>
      </div>
    </div>
  );
}

export default App;
