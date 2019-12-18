import { Injectable } from '@angular/core';
import {
    HttpRequest, HttpHandler,
    HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PageService } from '../services/page.service';

@Injectable({
    providedIn: 'root'
})
export class LoaderInterceptorService implements HttpInterceptor {

    constructor(private pageService: PageService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.headers.get('load-type') !== 'sync') {
            return next.handle(request);
        }
        this.pageService.isLoading = true;
        return next.handle(request).pipe(finalize(() => {
            this.pageService.isLoading = false;
        }));
    }

}
