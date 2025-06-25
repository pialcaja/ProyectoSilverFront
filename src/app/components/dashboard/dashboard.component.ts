import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Modal } from 'bootstrap';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  @ViewChild('modalActualizarUsuario') modalElementRef!: ElementRef;
  modalInstance!: Modal;

  @ViewChild('btnUsuarios', { static: false }) btnUsuariosRef!: ElementRef;

  seccion: 'usuarios' | 'videojuegos' | 'categorias' = 'usuarios';
  usuarios: any[] = [];


  ngOnInit(): void {

    if (this.seccion === 'usuarios') {
      this.estadoSeleccionado = 'ACTIVO';
      this.cargarUsuarios();
    }
  }

  ngAfterViewInit(): void {
    if (this.modalElementRef) {
      this.modalInstance = new Modal(this.modalElementRef.nativeElement);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  estadoSeleccionado: 'ACTIVO' | 'INACTIVO' | null = null;
  rolSeleccionado: string | null = null;
  mensajeBackend: string | null = null;

  cargarUsuarios() {
    if (!this.estadoSeleccionado) {
      return;
    }
    this.usuarioService
      .listarUsuarios(this.estadoSeleccionado, this.rolSeleccionado ?? undefined)
      .subscribe({
        next: (res) => {
          this.usuarios = res.usuarios || [];
          this.mensajeBackend = res.mensaje || null;
        },
        error: (err) => {
          this.usuarios = [];
          this.mensajeBackend = err.error?.mensaje || 'Error al obtener usuarios.';
          console.error('Error al cargar usuarios', err);
        },
      });
  }

  cambiarEstado(estado: string) {
    if (estado !== 'ACTIVO' && estado !== 'INACTIVO') return;
    this.estadoSeleccionado = estado;
    this.cambiarRol(null);
    this.cargarUsuarios();
  }

  cambiarRol(rol: string | null) {
    this.rolSeleccionado = rol;
    this.cargarUsuarios();
  }

  modalAbierto = false;
  usuarioSeleccionado: any = null;
  nuevaPassword: string = '';

  actualizarUsuario(usuario: any) {
    this.usuarioSeleccionado = { ...usuario };
    this.nuevaPassword = '';

    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(this.modalElementRef.nativeElement);
    }

    this.modalInstance.show();
  }

  cerrarModal() {
    this.modalInstance?.hide();

    setTimeout(() => {
      this.usuarioSeleccionado = null;
      this.nuevaPassword = '';

      // Evita que el foco quede en elementos ocultos
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 300);
  }

  guardarCambios() {
    if (!this.usuarioSeleccionado) return;

    const usuarioActualizado = {
      ...this.usuarioSeleccionado,
      password: this.nuevaPassword || this.usuarioSeleccionado.password
    };

    this.usuarioService.actualizarUsuario(usuarioActualizado).subscribe({
      next: (res) => {
        this.cargarUsuarios();
        this.cerrarModal();
        this.nuevaPassword = '';
      },
      error: (err) => {
        console.error('Error al actualizar usuario', err);
      },
    });
  }

  desactivarUsuario(id: number) {

    this.usuarioService.desactivarUsuario(id).subscribe({
      next: (res) => {
        this.mensajeBackend = res.mensaje || 'Usuario desactivado';
        this.cargarUsuarios();
      },
      error: (err) => {
        this.mensajeBackend = err.error?.mensaje || 'Error al desactivar usuario.';
      }
    });
  }

  reactivarUsuario(id: number) {
    this.usuarioService.reactivarUsuario(id).subscribe({
      next: (res) => {
        this.mensajeBackend = res.mensaje || 'Usuario activado correctamente';
        this.cargarUsuarios();
      },
      error: (err) => {
        this.mensajeBackend = err.error?.mensaje || 'Error al activar usuario.';
      }
    });
  }

  passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  validarPassword() {
    if (!this.nuevaPassword) return true; // opcional, sin validar si está vacío

    if (this.nuevaPassword.length < 6) return false;
    if (!this.passwordPattern.test(this.nuevaPassword)) return false;

    return true;
  }
}
