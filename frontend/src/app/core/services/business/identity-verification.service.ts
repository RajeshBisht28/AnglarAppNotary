import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class IdentityVerificationService {
 private BASE_URL = environment.API_URL + environment.API_PATH;
  private ENDPOINT = environment.IDENTITY_UPLOAD_ENDPOINT || 'identity/verification/upload';

  constructor(private http: HttpClient) {}

  preprocessIdImage(imageBase64: string): Observable<any> {
    const url = `${this.BASE_URL}/eNotary/id-card/preprocess`;
    return this.http.post(url, { image_blob: imageBase64 });
  }
}
