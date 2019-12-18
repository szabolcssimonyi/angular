import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { Token } from '../interfaces/token';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private tokenService: TokenService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.get();
    let request = req;
    if (Boolean(token)) {
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${(token as Token).access_token}`,
        }
      });
    }
    return next.handle(request);
  }

}
