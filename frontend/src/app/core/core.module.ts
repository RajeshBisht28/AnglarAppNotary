import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { LoggerService } from './services/logger.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MATERIAL_IMPORTS } from '../shared';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ...MATERIAL_IMPORTS
  ],
  providers: [
    AuthService,
    LoggerService,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.'
      );
    }
  }
}