
import json
import subprocess
from pathlib import Path
from datetime import datetime, timedelta, timezone

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

HOST = "127.0.0.1"
PORT = 8000

BASE_DIR = Path(__file__).resolve().parent
TOKEN_FILE = BASE_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

ALLOWED_APPS = {
    "mail": "com.apple.mail",
    "calendar": "com.apple.iCal",
    "notes": "com.apple.Notes",
    "files": "com.apple.finder"
}


def get_calendar_events():
    if not TOKEN_FILE.exists():
        raise RuntimeError("Google Calendar is not connected. Run setup_calendar.py first.")

    creds = Credentials.from_authorized_user_file(
        str(TOKEN_FILE), SCOPES
    )

    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            TOKEN_FILE.write_text(creds.to_json())
        else:
            raise RuntimeError("Google authorization expired. Run setup_calendar.py again.")

    service = build("calendar", "v3", credentials=creds)

    now = datetime.now(timezone.utc)
    end = now + timedelta(days=7)

    calendar_list = service.calendarList().list().execute()
    all_events = []

    for calendar in calendar_list.get("items", []):
        calendar_id = calendar["id"]
        calendar_name = calendar.get("summary", "Calendar")

        result = service.events().list(
            calendarId=calendar_id,
            timeMin=now.isoformat(),
            timeMax=end.isoformat(),
            maxResults=30,
            singleEvents=True,
            orderBy="startTime"
        ).execute()

        for event in result.get("items", []):
            start = event.get("start", {})
            finish = event.get("end", {})

            all_events.append({
                "title": event.get("summary", "Untitled event"),
                "start": start.get("dateTime") or start.get("date"),
                "end": finish.get("dateTime") or finish.get("date"),
                "allDay": "date" in start,
                "calendar": calendar_name
            })

    all_events.sort(key=lambda item: item["start"])

    return {
        "success": True,
        "events": all_events,
        "count": len(all_events)
    }


class ChikkuHandler(SimpleHTTPRequestHandler):

    def send_json(self, data, status=200):
        response = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    
    def do_GET(self):
        path = self.path.split("?", 1)[0]

        if path == "/api/events":
            try:
                self.send_json(get_calendar_events())
            except Exception as error:
                print("Calendar error:", error)
                self.send_json({
                "success": False,
                "error": "Could not retrieve calendar events."
            }, 500)
            return

        return super().do_GET()


    def do_POST(self):
        if self.path != "/launch":
            self.send_error(404)
            return

        origin = self.headers.get("Origin")
        allowed_origins = {
            f"http://{HOST}:{PORT}",
            f"http://localhost:{PORT}"
        }

        if origin not in allowed_origins:
            self.send_error(403, "Origin not allowed")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))

            if length <= 0 or length > 1024:
                self.send_error(400, "Invalid request size")
                return

            body = json.loads(self.rfile.read(length))
            app = body.get("app")

            if app not in ALLOWED_APPS:
                self.send_error(400, "Application not allowed")
                return

            subprocess.Popen([
                "open", "-b", ALLOWED_APPS[app]
            ])

            self.send_json({
                "success": True,
                "app": app
            })

        except (ValueError, json.JSONDecodeError):
            self.send_error(400, "Invalid request")

        except Exception:
            self.send_error(500, "Could not launch application")


server = ThreadingHTTPServer((HOST, PORT), ChikkuHandler)

print(f"CHIKKU OS running at http://{HOST}:{PORT}")
print("Google Calendar integration is ready.")
print("Local app launcher is ready.")
print("Press Ctrl+C to stop.")

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nCHIKKU OS stopped.")
    server.server_close()
