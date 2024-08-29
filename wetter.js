const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weather_box = document.querySelector('.weather-box');
const weather_details = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');

const aktuell = document.querySelector('.status');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.querySelector('.weather-details .humidity span');
const wind = document.querySelector('.weather-details .wind span');
const weatherIcon = document.querySelector('.weather-icon'); 
const currentTime = document.querySelector('.current-time');

search.addEventListener('click', () => {

  const API_key = 'YOUR_API_KEY';
  const city = document.querySelector('.search-box input').value;

  if (city === '') return;

  fetch(`https://api.weatherapi.com/v1/current.json?key=${API_key}&q=${city}&aqi=no`)
    .then(response => response.json())
    .then(data => {
        const code = data.current.condition.code;
        console.log(code);
        const icon = selectWeatherIcon(code);
        console.log(icon);
        weatherIcon.src = icon;
        
      const currentWeather = data.current; 

      if (currentWeather) {

        if (currentWeather.temp_c) {
          temperature.innerHTML = `${parseInt(currentWeather.temp_c)}<span>°C</span>`;
        } else {
          temperature.innerHTML = "Keine Temperaturdaten";
        }

        if (currentWeather.condition && currentWeather.condition.text) { // deutsch umwandeln!!!
          const english_condition = currentWeather.condition.text;
          const german_condition = weather_conditions_german[english_condition];
          if(german_condition){
          description.innerHTML = german_condition;
        } else {
          description.innerHTML = "Wetter";
        }
        }else{
          description.innerHTML = "Keine Beschreibung";
        }

        if (currentWeather.humidity) {
          humidity.innerHTML = `${currentWeather.humidity}%`;
        } else {
          humidity.innerHTML = "Keine Luftfeuchtigkeit";
        }

        if (currentWeather.wind_kph) {
          wind.innerHTML = `${parseInt(currentWeather.wind_kph)} Km/h`;
        } else {
          wind.innerHTML = "Keine Winddaten";
        }

        weather_box.style.display = '';
        weather_details.style.display = '';
        weather_box.classList.add('fadeIn');
        weather_details.classList.add('fadeIn');
        container.style.height = '940px';
        container.style.width = '700px';

      } else {

        error404.style.display = 'block';
        error404.classList.add('fadeIn');
        container.style.height = '400px';
        weather_box.style.display = 'none';
        weather_details.style.display = 'none';

      }

      if (currentWeather.condition && currentWeather.condition.code) {

        weatherIcon.className = '';
        weatherIcon.classList.add(...icon.split(' '));

      }
      // Stündliche Wettervorhersage abrufen
      fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_key}&q=${city}&days=1&aqi=no`)
    .then(response => response.json())
    .then(data => {
      const hourlyForecast = data.forecast.forecastday[0].hour; // Stündliche Wettervorhersage für den ersten Tag
      const hourlyWeatherContainer = document.querySelector('.hourly-forecast');
      const desiredHours = [10, 12, 16, 20];

        // Entferne alle bestehenden Elemente aus dem Container
      hourlyWeatherContainer.innerHTML = '';

        // Filtere die stündliche Wettervorhersage nach den gewünschten Stunden
      const filteredForecast = hourlyForecast.filter(hourData => {
      const hour = new Date(hourData.time_epoch * 1000).getHours();
      return desiredHours.includes(hour);
    });

        // Durchlaufe die gefilterte stündliche Wettervorhersage und erstelle HTML-Elemente
    filteredForecast.forEach(hourData => {
      const hour = new Date(hourData.time_epoch * 1000).getHours();
      const weatherCode = hourData.condition.code;
      const englishCondition = hourData.condition.text.trim(); // Englische Beschreibung des Wetterzustands
      const germanCondition = weather_conditions_german[englishCondition] || englishCondition; // Deutsche Übersetzung oder Originaltext
      console.log(englishCondition);
      const icon = selectWeatherIcon(weatherCode);

      const hourElement = document.createElement('div');
      hourElement.classList.add('hour');
      hourElement.innerHTML = `
        <span>${hour}:00</span>
        <img src="${icon}" alt="Weather">
        <span>${germanCondition}</span>`;
        
      hourlyWeatherContainer.appendChild(hourElement);
    });
  })
  .catch(error => {
    console.error("Fehler beim Abrufen der stündlichen Wettervorhersage:", error);
  });
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_key}&q=${city}&days=7&aqi=no`)
  .then(response => response.json())
  .then(data => {
      const weeklyForecast = data.forecast.forecastday;
      const weeklyForecastContainer = document.querySelector('.weekly-forecast');

      // Entferne alle bestehenden Elemente aus dem Container
      weeklyForecastContainer.innerHTML = '';

      // Durchlaufe die Wochenvorhersage und erstelle HTML-Elemente
      weeklyForecast.forEach(day => {
          const dayElement = document.createElement('div');
          dayElement.classList.add('day');
          dayElement.innerHTML = `
              <p>${new Date(day.date_epoch * 1000).toLocaleDateString('de-DE', { weekday: 'long' })}</p>
              <img src="${selectWeatherIcon(day.day.condition.code)}" alt="${day.day.condition.text}">
              <p>${day.day.maxtemp_c}°C</p>
          `;
          weeklyForecastContainer.appendChild(dayElement);
      });
  })
  .catch(error => {
      console.error("Fehler beim Abrufen der Wochenvorhersage:", error);
  });
    })
    .catch(error => {
      console.error("Fehler beim Abrufen der Wetterdaten:", error);
    });

});

function selectWeatherIcon(code) {
  console.log('API-Code:', code);
  for (let i = 0; i < weather_icons.length; i++) {
    if (weather_icons[i].code === code) {
      return weather_icons[i].icon;
    }
  }
  return 'images/404.png'; 
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  currentTime.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateTime, 1000);
