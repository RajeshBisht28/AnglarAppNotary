import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserPackage, PackageResponse } from 'src/app/models/package.model';
import { DashboardStats } from 'src/app/models/dashboard.models';
import { JournalEntry } from 'src/app/models/journal.model';
import { NotaryProfileResponse } from 'src/app/models/notary-profile.model';

@Injectable({
  providedIn: 'root'
})
export class NotaryUserAPIService {

  private BASE_URL = environment.API_URL + environment.API_PATH;

  constructor(private http: HttpClient) { }

  getPackages = (type: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages?type=${type}`)
      .pipe(map((data: any) => data));

  findUserPackages = (type: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/user-packages?type=${type}`)
      .pipe(map((data: any) => data));

  getUserPackages = (): Observable<UserPackage[]> =>
    this.http
      .get<PackageResponse>(`${this.BASE_URL}/eNotary/user-packages`)
      .pipe(map((data: any) => data.packages || data));

  createSession = (packageId: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/session_id`)
      .pipe(map((data: any) => data));

  sendEmailSession = (packageId: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/instant-session`)
      .pipe(map((data: any) => data));

  getDashboardStats = (): Observable<DashboardStats> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/user-dashboard`)
      .pipe(map((data: any) => data));

  getNotaryDashboardStats = (): Observable<DashboardStats> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/dashboard`)
      .pipe(map((data: any) => data));

  scheduleSession = (packageId: string, date: string, time: string): Observable<any> =>
    this.http
      .post(`${this.BASE_URL}/eNotary/packages/${packageId}/schedule-session`, { date, time })
      .pipe(map((data: any) => data));

  getJournal = (): Observable<JournalEntry[]> =>
    this.http
      .get<JournalEntry[]>(`${this.BASE_URL}/eNotary/ron-journal`)
      .pipe(map((data: any) => Array.isArray(data) ? data : data.journalEntries || []));

  getPackageJournal = (packageId: string): Observable<JournalEntry> =>
    this.http
      .get<JournalEntry>(`${this.BASE_URL}/eNotary/package/${packageId}/ron-journal`)
      .pipe(map((data: any) => data));

  fetchNotaries = (type: 'Instant' | 'Scheduled'): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/session/${type}/notaries`)
      .pipe(map((data: any) => data));

  setAsSigner = (packageId: string, notaryId: number): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/notary/${notaryId}/set-as-signer`)
      .pipe(map((data: any) => data));

  getNotaryProfile = (): Observable<NotaryProfileResponse> =>
    this.http
      .get<NotaryProfileResponse>(`${this.BASE_URL}/RON/notary/me`)
      .pipe(map((data: any) => data));

  postNotaryProfile = (
    body: any
  ): Observable<NotaryProfileResponse> => {
    return this.http.post<NotaryProfileResponse>(
      `${this.BASE_URL}/RON/notary/me`,
      body
    );
  };

}
