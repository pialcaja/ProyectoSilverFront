import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class NoAdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    const token = this.authService.getAccessToken();

    if (!token) {
      return true;
    }

    try {
      const decoded: any = jwtDecode(token);
      const roles: string[] = decoded['roles'] || [];

      if (roles.includes('ROLE_ADMIN')) {
        this.authService.logout();
        this.router.navigate(['/login']);
        return false;
      }

      return true;

    } catch (error) {
      this.authService.logout();
      return true;
    }
  }
}
