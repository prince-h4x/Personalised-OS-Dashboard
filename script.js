
// CHIKKU OS — SYSTEM SCRIPT

// LIVE CLOCK
function updateClock() {
  const now = new Date();

  document.getElementById("time").textContent =
    now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

  document.getElementById("date").textContent =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  const hour = now.getHours();
  let greeting = "Good evening.";

  if (hour < 12) greeting = "Good morning.";
  else if (hour < 17) greeting = "Good afternoon.";

  document.getElementById("greeting").textContent =
    greeting + " Welcome back.";
}

// TASK MANAGER
const taskCheckboxes = document.querySelectorAll(".task input");
const progressFill = document.querySelector(".progress-fill");
const taskMetric = document.querySelector(
  ".panel:nth-child(4) .metric"
);
const taskTag = document.querySelector(
  ".panel:nth-child(4) .tag"
);

function updateTasks() {
  const total = taskCheckboxes.length;

  const completed = [...taskCheckboxes]
    .filter(task => task.checked).length;

  const percentage = total === 0
    ? 0
    : (completed / total) * 100;

  progressFill.style.width = percentage + "%";

  taskMetric.innerHTML =
    String(total - completed).padStart(2, "0") +
    ' <span>tasks remaining</span>';

  taskTag.textContent =
    String(completed).padStart(2, "0") +
    " / " +
    String(total).padStart(2, "0") +
    " DONE";

  localStorage.setItem(
    "chikkuTasks",
    JSON.stringify(
      [...taskCheckboxes].map(task => task.checked)
    )
  );
}

const savedTasks = JSON.parse(
  localStorage.getItem("chikkuTasks") || "[]"
);

taskCheckboxes.forEach((task, index) => {
  task.checked = savedTasks[index] || false;
  task.addEventListener("change", updateTasks);
});

updateTasks();

// DAILY AI BRIEFING
function dailyBriefing() {
  const message =
    "Welcome back. Chikku is online. " +
    "Your personal dashboard is ready. " +
    "You have " +
    [...taskCheckboxes].filter(task => !task.checked).length +
    " tasks remaining. Let's make today productive.";

  document.getElementById("assistant-message").textContent =
    "Your briefing is now playing.";

  const synth = window.speechSynthesis;
  synth.cancel();

  const speech = new SpeechSynthesisUtterance(message);
  const voices = synth.getVoices();

  const voice = voices.find(v => v.name === "Samantha");

  if (voice) speech.voice = voice;

  speech.lang = "en-US";
  speech.rate = 0.92;
  speech.pitch = 1.05;
  speech.volume = 1;

  synth.speak(speech);
}

// BUTTONS
document.getElementById("speakBtn")
  .addEventListener("click", dailyBriefing);

document.getElementById("fullscreenBtn")
  .addEventListener("click", async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  });

// INITIALIZE
updateClock();
setInterval(updateClock, 1000);

// ==================================
// CHIKKU OS — LIVE WEATHER
// ==================================

async function updateWeather() {
  const status = document.getElementById("weatherStatus");
  const icon = document.getElementById("weatherIcon");
  const temp = document.getElementById("weatherTemp");
  const condition = document.getElementById("weatherCondition");
  const humidity = document.getElementById("weatherHumidity");
  const wind = document.getElementById("weatherWind");
  const updated = document.getElementById("weatherUpdated");

  try {
    status.textContent = "UPDATING";

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=30.9010" +
      "&longitude=75.8573" +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day" +
      "&timezone=Asia%2FKolkata";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather service unavailable");
    }

    const data = await response.json();
    const current = data.current;

    const weatherTypes = {
      0: ["Clear sky", "☀️"],
      1: ["Mainly clear", "🌤️"],
      2: ["Partly cloudy", "⛅"],
      3: ["Overcast", "☁️"],
      45: ["Foggy", "🌫️"],
      48: ["Depositing rime fog", "🌫️"],
      51: ["Light drizzle", "🌦️"],
      53: ["Moderate drizzle", "🌦️"],
      55: ["Dense drizzle", "🌧️"],
      61: ["Slight rain", "🌦️"],
      63: ["Moderate rain", "🌧️"],
      65: ["Heavy rain", "🌧️"],
      71: ["Slight snowfall", "🌨️"],
      73: ["Moderate snowfall", "🌨️"],
      75: ["Heavy snowfall", "❄️"],
      80: ["Rain showers", "🌦️"],
      81: ["Moderate showers", "🌧️"],
      82: ["Heavy showers", "⛈️"],
      95: ["Thunderstorm", "⛈️"],
      96: ["Thunderstorm with hail", "⛈️"],
      99: ["Thunderstorm with hail", "⛈️"]
    };

    const weather =
      weatherTypes[current.weather_code] ||
      ["Current conditions", "🌤️"];

    if (current.is_day === 0 && current.weather_code <= 2) {
      icon.textContent = "🌙";
    } else {
      icon.textContent = weather[1];
    }

    temp.textContent =
      Math.round(current.temperature_2m) + "°C";

    condition.textContent = weather[0];

    humidity.textContent =
      current.relative_humidity_2m + "%";

    wind.textContent =
      Math.round(current.wind_speed_10m) + " km/h";

    status.textContent = "LIVE";

    const time = new Date(data.current.time);

    updated.textContent =
      "Updated " +
      time.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

  } catch (error) {
    console.error("CHIKKU weather error:", error);

    status.textContent = "OFFLINE";
    condition.textContent = "Weather unavailable";
    updated.textContent = "Check your internet connection";
  }
}

// Load weather immediately
updateWeather();

// Refresh every 15 minutes
setInterval(updateWeather, 15 * 60 * 1000);

// ==================================
// CHIKKU OS — 7 DAY FORECAST
// ==================================

async function updateForecast() {
  const forecastList = document.getElementById("forecastList");

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=30.9010" +
      "&longitude=75.8573" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=Asia%2FKolkata" +
      "&forecast_days=7";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Forecast service unavailable");
    }

    const data = await response.json();
    const daily = data.daily;

    const icons = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      53: "🌦️",
      55: "🌧️",
      56: "🌧️",
      57: "🌧️",
      61: "🌦️",
      63: "🌧️",
      65: "🌧️",
      66: "🌧️",
      67: "🌧️",
      71: "🌨️",
      73: "❄️",
      75: "❄️",
      77: "❄️",
      80: "🌦️",
      81: "🌧️",
      82: "⛈️",
      85: "🌨️",
      86: "❄️",
      95: "⛈️",
      96: "⛈️",
      99: "⛈️"
    };

    forecastList.innerHTML = "";

    daily.time.forEach((date, index) => {
      const dayDate = new Date(date + "T12:00:00");

      const dayName = index === 0
        ? "Today"
        : dayDate.toLocaleDateString("en-IN", {
            weekday: "short"
          });

      const symbol = icons[daily.weather_code[index]] || "🌤️";

      const high = Math.round(daily.temperature_2m_max[index]);
      const low = Math.round(daily.temperature_2m_min[index]);

      const rain = daily.precipitation_probability_max?.[index];

      const row = document.createElement("div");
      row.className = "forecast-day";

      const day = document.createElement("span");
      day.className = "forecast-day-name";
      day.textContent = dayName;

      const weatherIcon = document.createElement("span");
      weatherIcon.className = "forecast-icon";
      weatherIcon.textContent = symbol;

      const temperatures = document.createElement("span");
      temperatures.className = "forecast-temperatures";

      const highElement = document.createElement("b");
      highElement.className = "forecast-high";
      highElement.textContent = high + "°";

      const lowElement = document.createElement("span");
      lowElement.className = "forecast-low";
      lowElement.textContent = low + "°";

      temperatures.append(highElement, lowElement);

      const rainElement = document.createElement("span");
      rainElement.className = "forecast-rain";
      rainElement.textContent =
        rain == null ? "--" : rain + "% rain";

      row.append(day, weatherIcon, temperatures, rainElement);
      forecastList.appendChild(row);
    });

  } catch (error) {
    console.error("CHIKKU forecast error:", error);
    forecastList.textContent = "Forecast temporarily unavailable.";
  }
}

updateForecast();

// Refresh forecast every 30 minutes
setInterval(updateForecast, 30 * 60 * 1000);

// ==================================
// CHIKKU OS — MAC APP LAUNCHER
// ==================================

const appButtons = document.querySelectorAll(".app-item[data-app]");
const launchStatus = document.getElementById("launchStatus");

appButtons.forEach(button => {
  button.addEventListener("click", async () => {

    const app = button.dataset.app;
    const appName = button.textContent.trim();

    launchStatus.textContent = "Launching " + appName + "...";
    button.disabled = true;

    try {
      const response = await fetch("/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ app })
      });

      if (!response.ok) {
        throw new Error("Launch request failed");
      }

      launchStatus.textContent = appName + " launched successfully";

    } catch (error) {
      console.error("CHIKKU launcher:", error);
      launchStatus.textContent = "Could not launch " + appName;
    } finally {
      button.disabled = false;
    }

  });
});



function getCalendarDate(dateString, allDay) {
    if (allDay) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(dateString);
}

function isToday(date) {
    const now = new Date();

    return date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();
}

function formatEventDate(date) {
    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

function formatEventTime(date) {
    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit"
    });
}

async function loadCalendarEvents() {
    const status = document.getElementById("calendarStatus");
    const container = document.getElementById("scheduleEvents");
    const updated = document.getElementById("calendarUpdated");

    if (!status || !container) return;

    try {
        const response = await fetch("/api/events");

        if (!response.ok) {
            throw new Error("Calendar request failed");
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error("Calendar unavailable");
        }

        status.textContent = "CONNECTED";
        container.replaceChildren();

        if (!data.events || data.events.length === 0) {
            const empty = document.createElement("div");
            empty.className = "calendar-empty";
            empty.textContent = "Your schedule is clear for the next 7 days.";
            container.appendChild(empty);
        }

        data.events.forEach(event => {
            const start = getCalendarDate(event.start, event.allDay);
            const end = event.end
                ? getCalendarDate(event.end, event.allDay)
                : null;

            const today = isToday(start);

            const card = document.createElement("div");
            card.className = today
                ? "calendar-event calendar-event--today"
                : "calendar-event";

            const top = document.createElement("div");
            top.className = "calendar-event__top";

            const title = document.createElement("strong");
            title.className = "calendar-event__title";
            title.textContent = event.title || "Untitled event";

            top.appendChild(title);

            if (today) {
                const badge = document.createElement("span");
                badge.className = "calendar-event__badge";
                badge.textContent = "TODAY";
                top.appendChild(badge);
            }

            const date = document.createElement("div");
            date.className = "calendar-event__date";
            date.textContent = formatEventDate(start);

            const time = document.createElement("div");
            time.className = "calendar-event__time";

            if (event.allDay) {
                time.textContent = "All day";
            } else {
                time.textContent = formatEventTime(start);

                if (end) {
                    time.textContent += " – " + formatEventTime(end);
                }
            }

            const calendar = document.createElement("div");
            calendar.className = "calendar-event__calendar";
            calendar.textContent = event.calendar || "Google Calendar";

            const details = document.createElement("div");
            details.className = "calendar-event__details";
            details.append(date, time, calendar);

            card.append(top, details);
            container.appendChild(card);
        });

        if (updated) {
            updated.textContent = "SYNCED · " +
                new Date().toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit"
                });
        }

    } catch (error) {
        status.textContent = "OFFLINE";
        container.textContent =
            "Calendar unavailable. CHIKKU will try again shortly.";

        console.error("CHIKKU Calendar:", error);
    }
}

loadCalendarEvents();
setInterval(loadCalendarEvents, 5 * 60 * 1000);

