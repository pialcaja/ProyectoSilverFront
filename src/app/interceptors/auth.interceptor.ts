import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthEndpoint) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            if (res?.accessToken && res?.refreshToken) {
              authService.saveTokens(res.accessToken, res.refreshToken);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
              });
              return next(retryReq);
            } else {
              authService.logout();
              return throwError(() => new Error('No se pudo refrescar el token'));
            }
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
