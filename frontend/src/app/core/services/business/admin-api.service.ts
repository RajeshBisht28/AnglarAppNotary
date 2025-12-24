import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {

  private BASE_URL = environment.API_URL + environment.API_PATH;

  constructor(private http: HttpClient) { }

  getAccounts(): Observable<any> {
    const url = `${this.BASE_URL}/eNotary/accounts`;
    return this.http.get<any>(url);
  }
}
