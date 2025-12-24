export interface AuditLogEntry {
  id: string;
  event: string;
  eventDescription: string;
  ip: string;
  eventBy: string;
  eventAt?: string;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  total?: number;
}
