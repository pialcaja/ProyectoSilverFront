import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html'
})
export class RegistroComponent {
  nombre = '';
  email = '';
  password = '';
  error = '';
  success = '';

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private alertaService = inject(AlertaService);

  register() {
    const nuevoUsuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    this.usuarioService.registrar(nuevoUsuario).subscribe({
      next: () => {
        this.alertaService.mostrarMensaje('success', '¡Registrado!', 'Registro exitoso. Ahora puedes iniciar sesión');
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || 'Error al registrar usuario';
        this.alertaService.mostrarMensaje('error', 'Error de registro', mensaje);
      }
    });
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }
}

