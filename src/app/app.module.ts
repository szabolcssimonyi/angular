import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MessageModule, MessageService } from 'primeng/primeng';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PageModule } from './page/page.module';
import { AuthInterceptorService } from './interceptors/auth-interceptor.service';
import { ErrorInterceptorService } from './interceptors/error-interceptor.service';
import { ToastModule } from 'primeng/toast';
import { mockBackendInterceptor } from './interceptors/mock-backend-interceptor.service';
import { LoaderInterceptorService } from './interceptors/loader-interceptor.service';
import { NoCacheInterceptorService } from './interceptors/no-cache-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    MessageModule,
    PageModule,
    ToastModule
  ],
  providers: [
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NoCacheInterceptorService, multi: true },
    // mockBackendInterceptor
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
