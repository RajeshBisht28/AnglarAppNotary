import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NotificationService } from '../services/notification.service';
import { environment } from 'src/environments/environment';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cookie: CookieService,
    private loaderService: LoadingService
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes('/ln-end-user/login') || request.url.includes('/auth/signup')) {
    return next.handle(request);
  }
    const modifiedReq = this.addAuthHeader(request);


    this.loaderService.show();

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
  const tokenStr = this.cookie.get(environment.LEAFLET_eNOTARY_TOKEN_KEY);
  let modifiedReq = request;
  if (tokenStr) {
    try {
      const tokenObj = JSON.parse(tokenStr);

      if (tokenObj?.accessToken && !request.headers.has('accessToken')) {
        modifiedReq = request.clone({
          headers: request.headers.append('accessToken', tokenObj.accessToken),
        });
      }
    } catch (err) {
      console.error('Invalid token format in cookie', err);
    //  this.cookie.delete(environment.LEAFLET_eNOTARY_TOKEN_KEY);
    }
  }
  return modifiedReq;
}


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = this.handleBadRequest(error);
          break;
        case 401:
          return this.handleUnauthorized(error);
        case 403:
          errorMessage = 'You are not authorized to perform this action';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 500:
          errorMessage = 'Internal server error occurred';
          break;
        default:
          errorMessage = `Server returned code ${error.status}`;
      }
    }

    this.notificationService.showError(errorMessage);
    return throwError(() => error);
  }

  private handleBadRequest(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      return Object.values(error.error.errors).join('\n');
    }
    return error.error?.message || 'Invalid request';
  }

  private handleUnauthorized(error: HttpErrorResponse): Observable<never> {
    if (this.router.url !== '/login') {
      this.notificationService.showError('Your session has expired. Please login again.');
      // this.authService.logout();
      // this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }
}