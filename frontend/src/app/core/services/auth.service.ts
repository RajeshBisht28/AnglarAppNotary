import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { map, Observable } from 'rxjs';
import { LoginRequest, User } from 'src/app/models/auth.models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly SIGN_UP_URL = 'ln-end-use/signup';

  private readonly LOGIN_URL = 'ln-end-user/login';

  private readonly LOGIN_NOTARY_URL = 'ln-eNotary/login';

  private readonly FORGOT_MAIL = 'ln-end-user/forgot-password';

  private readonly SET_PASSWORD = 'ln-end-user/set-password';

  private readonly NOTARY_FORGOT_MAIL = 'ln-eNotary/forgot-password';

  private readonly NOTARY_SET_PASSWORD = 'ln-eNotary/set-password';

  private readonly GUEST_LOGIN_URL = 'ln-end-user/guest-login';

  private BASE_URL = environment.API_URL + environment.API_PATH;

  private readonly COOKIE_EXPIRY_TIME = 30;

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  public signupUser(body: any): Observable<any | undefined> {
    return this.http.post(this.BASE_URL + this.SIGN_UP_URL, body).pipe(
      map((result: any) => {
        return result;
      })
    );
  }

  public loginEndUser(user: LoginRequest): Observable<User> {
    const basic = `Basic ${btoa(`${user.email}:${user.password}`)}`;

    const headers = new HttpHeaders({
      Authorization: basic,
      'Content-Type': 'text/plain',
    });

    return this.http.post<User>(this.BASE_URL + this.LOGIN_URL, null, { headers }).pipe(
      map((result: User) => {
        this.setAccountCookie(result, user.remember!);
        const userFromCookie = this.getUser();
        if (!userFromCookie) throw new Error("Failed to read user from cookie");
        return userFromCookie
      })
    );
  }

  public loginNotaryUser(user: LoginRequest): Observable<User> {
    const basic = `Basic ${btoa(`${user.email}:${user.password}`)}`;

    const headers = new HttpHeaders({
      Authorization: basic,
      'Content-Type': 'text/plain',
    });

    return this.http.post<User>(this.BASE_URL + this.LOGIN_NOTARY_URL, null, { headers }).pipe(
      map((result: User) => {
        this.setAccountCookie(result, user.remember!);
        const userFromCookie = this.getUser();
        if (!userFromCookie) throw new Error("Failed to read user from cookie");
        return userFromCookie
      })
    );
  }

  public loginGuest(signerId: string): Observable<User> {
    const body = { signerId };
    
    return this.http.post<User>(this.BASE_URL + this.GUEST_LOGIN_URL, body).pipe(
      map((result: User) => {
        this.setAccountCookie(result, false);
        const userFromCookie = this.getUser();
        if (!userFromCookie) throw new Error("Failed to read user from cookie");
        return userFromCookie
      })
    );
  }

  public sendForgotPasswordLink(emailBody: { email: string }): Observable<User> {
    return this.http.post<User>(
      this.BASE_URL + this.FORGOT_MAIL,
      emailBody
    );
  }

  public setPassword(passwordBody: { password: string, id: string }): Observable<User> {
    return this.http.post<User>(
      this.BASE_URL + this.SET_PASSWORD,
      passwordBody
    );
  }

  public sendNotaryForgotPasswordLink(emailBody: { email: string }): Observable<User> {
    return this.http.post<User>(
      this.BASE_URL + this.NOTARY_FORGOT_MAIL,
      emailBody
    );
  }

  public setNotaryPassword(passwordBody: { password: string, id: string }): Observable<User> {
    return this.http.post<User>(
      this.BASE_URL + this.NOTARY_SET_PASSWORD,
      passwordBody
    );
  }

  setAccountCookie(loginResult: any, remember: boolean) {
    this.deleteAllCookie();
    if (remember === true) {
      const date = new Date();
      date.setTime(
        date.getTime() + this.COOKIE_EXPIRY_TIME * 24 * 60 * 60 * 100
      );
      this.cookieService.set(
        environment.LEAFLET_eNOTARY_TOKEN_KEY,
        JSON.stringify(loginResult),
        date,
        '/',
        '',
        false,
        'None'
      );
    } else {
      this.cookieService.set(
        environment.LEAFLET_eNOTARY_TOKEN_KEY,
        JSON.stringify(loginResult),
        undefined,
        '/',
        '',
        false,
        'None'
      );
    }
  }

  public logout() {
    this.deleteAllCookie();
  }

  private deleteAllCookie() {
    this.cookieService.delete(environment.LEAFLET_eNOTARY_TOKEN_KEY, '/');
    this.cookieService.deleteAll();
  }

  private getToken(): string {
    return this.cookieService.get(environment.LEAFLET_eNOTARY_TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      return true;
    }
    return false;
  }

  public getUser(): User | undefined {
    const user = this.cookieService.get(environment.LEAFLET_eNOTARY_TOKEN_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return undefined;
  }

  public setTempToken(token: string) {
    const obj = {
      accessToken: token,
    };
    this.setAccountCookie(obj, false);
  }
}
