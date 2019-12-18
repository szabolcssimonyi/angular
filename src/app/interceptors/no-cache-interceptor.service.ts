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
export class NoCacheInterceptorService implements HttpInterceptor {

    constructor(private tokenService: TokenService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authReq = req.clone({
            // Prevent caching in IE, in particular IE11.
            // See: https://support.microsoft.com/en-us/help/234067/how-to-prevent-caching-in-internet-explorer
            setHeaders: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache'
            }
        });
        return next.handle(authReq);
    }

}
