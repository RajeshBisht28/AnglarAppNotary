export interface ScheduleRequest {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  timeZone: string; // IANA timezone, e.g., "America/New_York"
}
