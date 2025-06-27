import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { AlertaService } from '../../services/alerta.service';

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
  private alertaService = inject(AlertaService);

  @ViewChild('modalActualizarUsuario') modalElementRef!: ElementRef;
  modalInstance!: Modal;

  @ViewChild('btnUsuarios', { static: false }) btnUsuariosRef!: ElementRef;

  seccion: 'usuarios' | 'videojuegos' | 'categorias' = 'usuarios';
  usuarios: any[] = [];
  totalPaginas: number = 0;
  paginaActual: number = 0;
  tamanoPagina: number = 5;
  modalAbierto = false;
  usuarioSeleccionado: any = null;
  nuevaPassword: string = '';
  modoRegistro: boolean = false;
  textoBusqueda: string = '';
  totalUsuarios: number = 0;
  estadoSeleccionado: 'ACTIVO' | 'INACTIVO' | null = null;
  rolSeleccionado: string | null = null;
  mensajeBackend: string | null = null;
  passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  nombreUsuario: string | null = null;

  ngOnInit(): void {
    this.nombreUsuario = this.authService.getNombreUsuario();

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
    this.alertaService.mostrarConfirmacion(
      '¿Cerrar sesión?',
      '¿Estás seguro de que deseas cerrar sesión?',
      () => {
        this.authService.logout();
        this.router.navigateByUrl('/login');
      }
    );
  }

  cargarUsuarios() {
    if (!this.estadoSeleccionado) return;

    this.usuarioService
      .listarUsuarios(
        this.estadoSeleccionado,
        this.rolSeleccionado ?? undefined,
        this.paginaActual,
        this.tamanoPagina,
        this.textoBusqueda.trim()
      )
      .subscribe({
        next: (res) => {
          this.usuarios = res.usuarios || res.content || [];
          this.totalPaginas = res.totalPages || 1;
          this.totalUsuarios = res.totalItems || this.usuarios.length;
        },
        error: (err) => {
          this.usuarios = [];
          this.totalPaginas = 0;
          this.totalUsuarios = 0;
          this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje || 'Error al obtener usuarios');
        }
      });
  }

  onBuscarCambio() {
    this.paginaActual = 0;
    this.cargarUsuarios();
  }

  cambiarEstado(estado: string) {
    if (estado !== 'ACTIVO' && estado !== 'INACTIVO') return;
    this.estadoSeleccionado = estado;
    this.paginaActual = 0;
    this.cambiarRol(null);
    this.cargarUsuarios();
  }

  cambiarRol(rol: string | null) {
    this.rolSeleccionado = rol;
    this.paginaActual = 0;
    this.cargarUsuarios();
  }

  irAPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarUsuarios();
    }
  }

  registrarUsuario() {
    this.usuarioSeleccionado = {
      nombre: '',
      email: '',
      password: '',
      rol: 'USER',
      estado: 'A'
    };
    this.nuevaPassword = '';
    this.modoRegistro = true;

    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(this.modalElementRef.nativeElement);
    }

    this.modalInstance.show();
  }

  actualizarUsuario(usuario: any) {
    this.usuarioSeleccionado = { ...usuario };
    this.nuevaPassword = '';
    this.modoRegistro = false;

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

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 300);
  }

  guardarCambios() {
    if (!this.usuarioSeleccionado) return;

    const usuario = {
      ...this.usuarioSeleccionado,
      password: this.nuevaPassword || this.usuarioSeleccionado.password
    };

    if (this.modoRegistro) {
      this.usuarioService.registrar(usuario).subscribe({
        next: (res) => {
          this.cargarUsuarios();
          this.cerrarModal();
          this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje || 'Usuario registrado correctamente');
        },
        error: (err) => {
          this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje || 'Error al registrar el usuario');
        }
      });
    } else {
      this.alertaService.mostrarConfirmacion(
        '¿Confirmar actualización?',
        '¿Deseas guardar los cambios en este usuario?',
        () => {
          this.usuarioService.actualizarUsuarioAdmin(usuario).subscribe({
            next: (res: any) => {
              this.cargarUsuarios();
              this.cerrarModal();
              this.nuevaPassword = '';
              this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje || 'Usuario actualizado correctamente');
            },
            error: (err) => {
              this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje || 'Error al actualizar el usuario');
            },
          });
        }
      );
    }
  }

  desactivarUsuario(id: number) {
    this.alertaService.mostrarConfirmacion(
      '¿Eliminar usuario?',
      'El usuario no podrá iniciar sesión hasta ser recuperado.',
      () => {
        this.usuarioService.desactivarUsuario(id).subscribe({
          next: (res) => {
            this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje || 'Usuario eliminado correctamente');
            this.cargarUsuarios();
          },
          error: (err) => {
            this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje || 'Error al eliminar el usuario');
          }
        });
      }
    );
  }

  reactivarUsuario(id: number) {
    this.alertaService.mostrarConfirmacion(
      '¿Recuperar usuario?',
      'El usuario podrá iniciar sesión nuevamente.',
      () => {
        this.usuarioService.reactivarUsuario(id).subscribe({
          next: (res) => {
            this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje || 'Usuario recuperado correctamente');
            this.cargarUsuarios();
          },
          error: (err) => {
            this.alertaService.mostrarMensaje('error', '¡Éxito!', err.error?.mensaje || 'Error al recuperar el usuario');
          }
        });
      }
    );
  }

  validarPassword() {
    if (!this.nuevaPassword) return true; // opcional, sin validar si está vacío

    if (this.nuevaPassword.length < 6) return false;
    if (!this.passwordPattern.test(this.nuevaPassword)) return false;

    return true;
  }
}
