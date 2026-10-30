# CHIKKU OS — Personal Desktop Dashboard

A Python-powered personal desktop dashboard designed to bring everyday tools, information and productivity features together in one interface.

CHIKKU OS combines a modern dashboard UI with a Python backend, Google Calendar integration, live weather information, task management and macOS application launching.

## Dashboard Preview

![CHIKKU OS Dashboard](screenshots/dashboard.png)

## Features

- **Live Clock & Date:** Displays the current time and date.
- **Weather Dashboard:** Displays current weather and a 7-day forecast using Open-Meteo.
- **Google Calendar Integration:** Retrieves upcoming calendar events using the Google Calendar API.
- **OAuth 2.0 Authentication:** Uses Google's OAuth authorization flow for calendar access.
- **Automatic Synchronization:** Refreshes calendar information every five minutes.
- **Event Highlights:** Displays event dates, timings, calendar names and highlights today's events.
- **Task Management:** Allows tasks to be managed through the dashboard.
- **macOS Application Launcher:** Opens supported Mac applications directly from the dashboard.
- **Daily Briefing:** Uses browser text-to-speech functionality to provide a spoken briefing.
- **Dark Dashboard Interface:** A modern interface with a dark glass-style visual design.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend development |
| HTML | Dashboard structure |
| CSS | Styling and layout |
| JavaScript | Frontend functionality |
| Google Calendar API | Calendar integration |
| OAuth 2.0 | Authorization |
| Open-Meteo API | Weather information |
| JSON | Calendar data and local configuration |
| macOS | Desktop application integration |

## Project Architecture

CHIKKU OS follows a simple client-server architecture.

1. The frontend is built using HTML, CSS and JavaScript.
2. The Python backend runs a local HTTP server.
3. The frontend requests calendar information from the backend.
4. The backend communicates with the Google Calendar API using authorized credentials.
5. The backend returns calendar information in JSON format.
6. JavaScript updates the dashboard with the retrieved information.

## Project Structure

```text
ChikkuOS/
│
├── index
