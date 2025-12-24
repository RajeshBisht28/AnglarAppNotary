import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuditLogEntry, AuditLogResponse } from 'src/app/models/audit-log.model';
import { AuditCapture, SessionType } from 'src/app/models/audit-capture.enum';

@Injectable({
  providedIn: 'root'
})
export class AuditLogAPIService {
  private BASE_URL = environment.API_URL + environment.API_PATH;

  constructor(private http: HttpClient) {}

  getAuditLog = (packageId: string): Observable<AuditLogEntry[]> =>
    this.http
      .get<AuditLogResponse>(`${this.BASE_URL}/eNotary/packages/${packageId}/audit-log`)
      .pipe(
        map((response: any) => {
          if (Array.isArray(response)) {
            return response;
          }
          return response.logs || [];
        })
      );

  auditCapture(body: {packageId: string, event: AuditCapture }): Observable<any> {
    const url = `${this.BASE_URL}/eNotary/audit-logs`;
    return this.http.post<any>(url, body);
  }

  startSessionRecord(action: SessionType, body: {packageId: string, sessionId: string}): Observable<any> {
    const url = `${this.BASE_URL}/eNotary/session/${action}`;
    return this.http.post<any>(url, body);
  }
}
