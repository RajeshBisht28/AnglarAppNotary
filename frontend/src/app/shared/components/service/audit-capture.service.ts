import { Injectable } from '@angular/core';
import { AuditLogAPIService } from 'src/app/core';
import { AuditCapture, SessionType } from 'src/app/models/audit-capture.enum';

@Injectable({
  providedIn: 'root'
})
export class AuditCaptureService {

  constructor(private auditLogApi: AuditLogAPIService) { }

  captureEvent(body: { packageId: string, event: AuditCapture }) {
    return this.auditLogApi.auditCapture(body).subscribe({
      next: () => {
      },
    });
  }

  sessionRecord(action: SessionType, body: { packageId: string, sessionId: string }) {
    return this.auditLogApi.startSessionRecord(action, body).subscribe({
      next: () => {
      },
    });
  }
}
