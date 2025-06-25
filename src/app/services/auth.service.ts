import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loginUrl = 'http://localhost:8091/auth/login';
  private readonly refreshUrl = 'http://localhost:8091/auth/refresh';

  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.loginUrl, credentials).pipe(
      tap((res: any) => this.saveTokens(res.accessToken, res.refreshToken))
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return of(null);

    return this.http.post(this.refreshUrl, { refreshToken }).pipe(
      tap((res: any) => this.saveTokens(res.accessToken, res.refreshToken)),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('No se pudo refrescar el token'));
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.scheduleRefresh(accessToken);
  }

  logout() {
    localStorage.clear();
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }

  initTokenMonitoring() {
    const token = this.getAccessToken();
    if (token) {
      this.scheduleRefresh(token);
    }
  }

  private scheduleRefresh(token: string) {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      const refreshIn = expiresAt - now - 30000; // 30s antes

      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      if (refreshIn > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken().subscribe();
        }, refreshIn);
      }
    } catch {
      this.logout();
    }
  }
}
