
from pathlib import Path
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta, timezone

BASE_DIR = Path(__file__).resolve().parent
creds = Credentials.from_authorized_user_file(
    str(BASE_DIR / "token.json"),
    ["https://www.googleapis.com/auth/calendar.readonly"]
)

service = build("calendar", "v3", credentials=creds)

now = datetime.now(timezone.utc)
end = now + timedelta(days=7)

calendars = service.calendarList().list().execute()

print("\nCHIKKU OS — CONNECTED CALENDARS\n")

for calendar in calendars.get("items", []):
    calendar_id = calendar["id"]
    calendar_name = calendar.get("summary", "Unnamed calendar")

    events = service.events().list(
        calendarId=calendar_id,
        timeMin=now.isoformat(),
        timeMax=end.isoformat(),
        maxResults=20,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    items = events.get("items", [])

    print(f"{calendar_name}: {len(items)} upcoming events")
    
print("\nCalendar connection test completed!")
