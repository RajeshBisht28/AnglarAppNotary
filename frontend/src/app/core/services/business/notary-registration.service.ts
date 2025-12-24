import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompleteRegistration, DigitalSeal, NotaryInformation, ProfileCertificate } from 'src/app/models/notary-registration.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotaryRegistrationService {

  private BASE_URL = environment.API_URL + environment.API_PATH + "ln-eNotary/signup/";

  constructor(private http: HttpClient) { }

  sealCreate(stage: string, payload: any): Observable<any> {
    const url = `${this.BASE_URL}ln-eNotary/signup/${stage}`;
    return this.http.post<any>(url, payload);
  }

  registerInformation(data: NotaryInformation): Observable<{status: boolean, id: string}> {
    return this.http.post<any>(`${this.BASE_URL}Information`, data);
  }

  uploadProfileCertificate(data: ProfileCertificate): Observable<{status: boolean}> {
    return this.http.post<any>(`${this.BASE_URL}ProfileCertificate`, data);
  }

  uploadDigitalSeal(data: DigitalSeal): Observable<{status: boolean}> {
    return this.http.post<any>(`${this.BASE_URL}DigitalSeal`, data);
  }

  completeRegistration(data: CompleteRegistration): Observable<{status: boolean}> {
    return this.http.post<any>(`${this.BASE_URL}CompleteRegistration`, data);
  }
}
