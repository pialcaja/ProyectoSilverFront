import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class NoUserGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    const token = this.authService.getAccessToken();

    if (!token) {
      this.router.navigate(['/inicio']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const roles: string[] = decoded['roles'] || [];

      if (roles.includes('ROLE_USER')) {
        this.router.navigate(['/inicio']);
        return false;
      }

      return true;

    } catch (error) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }
  }
}
