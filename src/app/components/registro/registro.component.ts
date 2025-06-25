import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

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

  register() {
    const nuevoUsuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    this.usuarioService.registrar(nuevoUsuario).subscribe({
      next: () => {
        this.success = 'Registro exitoso. Ahora puedes iniciar sesión.';
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al registrar usuario.';
      }
    });
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }
}

