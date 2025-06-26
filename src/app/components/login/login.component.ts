import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private alertaService = inject(AlertaService);

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.authService.saveTokens(res.accessToken, res.refreshToken);

        const decodedToken: any = jwtDecode(res.accessToken);
        const roles: string[] = decodedToken.roles || [];

        if (roles.includes('ROLE_ADMIN')) {
          this.router.navigateByUrl('/dashboard');
        } else if (roles.includes('ROLE_USER')) {
          this.router.navigateByUrl('/inicio');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || 'Credenciales incorrectas o error desconocido';
        this.alertaService.mostrarMensaje('error', 'Error de inicio de sesión', mensaje);
      }
    });
  }

  irAlRegistro() {
    this.router.navigateByUrl('/registro');
  }
}
