import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { UserService } from '../services/user.service';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        this.userService.clear();
        this.router.navigate([environment.routes.login]);
        return;
      }
      if (err.status === 422) {
        const fields = (err.error as any[]).map(e => e.field).join(',');
        const messages = (err.error as any[]).map(e => this.translateService.instant(e.message)).join(',');
        this.showError(`${fields}: ${messages}`);
        return throwError(err);
      }
      console.log(err);
      const message = Boolean(err.message) ? err.message : this.translateService.instant("GLOBAL.ERROR.FATAL_ERROR");
      this.showError(message);
      return throwError(err);
    }));
  }

  private showError(message: string) {
    this.messageService.add({
      key: 'global',
      severity: 'error',
      summary: this.translateService.instant('GLOBAL.ERROR.SUMMARY'),
      detail: message
    });
  }
}
