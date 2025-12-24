import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DigitalSeal } from 'src/app/models/notary-registration.model';

@Injectable({
  providedIn: 'root'
})
export class NotarizationApiService {

  private BASE_URL = environment.API_URL + environment.API_PATH;

  constructor(private http: HttpClient) { }

  createSession(sessionId: string): Observable<string> {
    const url = this.BASE_URL + 'eNotary/createSession';
    const body = { customSessionId: sessionId };
    return this.http.post<string>(url, body);
  }

  createToken(sessionId: string): Observable<{ token: string }> {
    const url = this.BASE_URL + 'eNotary/generateToken';
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post<{ token: string }>(url, {}, { params });
  }

  sealCreate(type: string, requestData: any): Observable<any> {
    const url = `${this.BASE_URL}eNotary/seal-create/${type}`;
    return this.http.post<any>(url, requestData);
  }

 getSeals(): Observable<string[]> {
  const url = `${this.BASE_URL}eNotary/seals`;
  return this.http.get<any>(url).pipe(
    map((res: any) => {
      const arr = Array.isArray(res?.signImage) ? res.signImage : [];
      return arr
        .map((item: any) => item?.signImage64)
        .filter((v: any) => typeof v === 'string' && v.length > 0);
    })
  );
}


}
