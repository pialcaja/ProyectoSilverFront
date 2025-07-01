import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { AlertaService } from '../../services/alerta.service';
import { VideojuegoService } from '../../services/videojuego.service';
import { CategoriaService } from '../../services/categoria.service';

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

  private _seccion: 'usuarios' | 'videojuegos' | 'categorias' = 'usuarios';
  get seccion() {
    return this._seccion;
  }
  set seccion(value: 'usuarios' | 'videojuegos' | 'categorias') {
    this._seccion = value;
    if (value === 'usuarios') {
      this.estadoSeleccionado = 'ACTIVO';
      this.cargarUsuarios();
    } else if (value === 'videojuegos') {
      this.cargarVideojuegos();
      this.cargarCategorias();
    }
  }

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
    this.seccion = 'usuarios';
  }

  ngAfterViewInit(): void {
    if (this.modalElementRef) {
      this.modalInstance = new Modal(this.modalElementRef.nativeElement);
    }
    if (this.modalActualizarVideojuegoRef) {
      this.modalVideojuegoInstance = new Modal(this.modalActualizarVideojuegoRef.nativeElement);
    }
    if (this.modalCategoriaRef) {
      this.modalCategoriaInstance = new Modal(this.modalCategoriaRef.nativeElement);
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
    if (!this.estadoSeleccionado) {
      return;
    }
    this.usuarioService
      .listarUsuarios(
        this.estadoSeleccionado,
        this.rolSeleccionado ?? undefined,
        this.paginaActual,
        this.tamanoPagina,
        this.textoBusqueda.trim())
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
        },
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
    if (!this.nuevaPassword) return true;

    if (this.nuevaPassword.length < 6) return false;
    if (!this.passwordPattern.test(this.nuevaPassword)) return false;

    return true;
  }


  //Videojuegos
  private videojuegoService = inject(VideojuegoService);

  @ViewChild('modalActualizarVideojuego') modalActualizarVideojuegoRef!: ElementRef;
  modalVideojuegoInstance!: Modal;

  videojuegos: any[] = [];
  videojuegoSeleccionado: any = null;
  modoRegistroVideojuego: boolean = false;

  filtroNombre = '';
  filtroId: number | null = null;
  filtroEstado = '';
  filtroCategoria = '';


  cargarVideojuegos() {
    this.videojuegoService.listarVideojuegos().subscribe({
      next: (res) => this.videojuegos = res.videojuegos || [],
      error: () => this.alertaService.mostrarMensaje('error', '¡Error!', 'No se pudieron cargar los videojuegos')
    });
  }

  registrarVideojuego() {
    this.videojuegoSeleccionado = {
      titulo: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      estado: 'A',
      categoria: {
        id: null
      }
    };
    this.modoRegistroVideojuego = true;
    this.modalVideojuegoInstance.show()
  }

  editarVideojuego(videojuego: any) {
    this.videojuegoSeleccionado = { ...videojuego };
    this.modoRegistroVideojuego = false;
    this.modalVideojuegoInstance.show()
  }

  cerrarModalVideojuego() {
    if (this.modalVideojuegoInstance) {
      this.modalVideojuegoInstance.hide();
    }

    setTimeout(() => {
      this.videojuegoSeleccionado = null;
      this.modoRegistroVideojuego = false;

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 300);
  }

  guardarCambiosVideojuego() {
    const { id, ...dto } = this.videojuegoSeleccionado;

    if (this.modoRegistroVideojuego) {
      this.videojuegoService.registrarVideojuego(dto).subscribe({
        next: (res) => {
          this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje);
          this.cargarVideojuegos();
          this.cerrarModalVideojuego();
        },
        error: (err) => this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje)
      });
    } else {
      this.videojuegoService.actualizarVideojuego(id, dto).subscribe({
        next: (res) => {
          this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje);
          this.cargarVideojuegos();
          this.cerrarModalVideojuego();
        },
        error: (err) => this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje)
      });
    }
  }


  buscarPorNombre() {
    if (!this.filtroNombre.trim()) {
      this.cargarVideojuegos();
      return;
    }

    this.filtroId = null;
    this.filtroEstado = '';
    this.filtroCategoria = '';

    this.videojuegoService.buscarVideojuegoPorNombre(this.filtroNombre).subscribe({
      next: (res) => this.videojuegos = res.videojuegos || [],
      error: () => this.alertaService.mostrarMensaje('error', 'Error', 'No se encontraron resultados')
    });
  }

  buscarPorId() {
    if (!this.filtroId || this.filtroId.toString().trim() === '') {
      this.cargarVideojuegos();
      return;
    }

    this.filtroNombre = '';
    this.filtroEstado = '';
    this.filtroCategoria = '';

    this.videojuegoService.buscarVideojuegoPorId(this.filtroId).subscribe({
      next: (res) => this.videojuegos = [res.videojuego],
      error: () => this.alertaService.mostrarMensaje('error', 'Error', 'Videojuego no encontrado')
    });
  }

  filtrarPorEstado() {
    if (!this.filtroEstado || this.filtroEstado === '') {
      this.cargarVideojuegos();
      return;
    }

    this.filtroNombre = '';
    this.filtroId = null;
    this.filtroCategoria = '';

    this.videojuegoService.buscarVideojuegoPorEstado([this.filtroEstado]).subscribe({
      next: (res) => this.videojuegos = res.videojuegos || [],
      error: () => this.alertaService.mostrarMensaje('error', 'Error', 'Sin resultados')
    });
  }

  filtrarPorCategoria() {
    if (!this.filtroCategoria || this.filtroCategoria === '') {
      this.cargarVideojuegos();
      return;
    }

    this.filtroNombre = '';
    this.filtroId = null;
    this.filtroEstado = '';

    this.videojuegoService.buscarVideojuegoPorCategoria(+this.filtroCategoria).subscribe({
      next: (res) => this.videojuegos = res.videojuegos || [],
      error: () => this.alertaService.mostrarMensaje('error', 'Error', 'Sin resultados')
    });
  }

  eliminarVideojuego(id: number) {
    this.alertaService.mostrarConfirmacion(
      '¿Eliminar videojuego?',
      'Esta acción marcará el videojuego como inactivo.',
      () => {
        this.videojuegoService.eliminarVideojuego(id).subscribe({
          next: (res) => {
            this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje || 'Eliminado correctamente');
            this.cargarVideojuegos();
          },
          error: (err) => {
            this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje || 'No se pudo eliminar');
          }
        });
      }
    );
  }


  //Categorias

  private categoriaService = inject(CategoriaService);

  categorias: any[] = [];
  categoriaSeleccionada: any = null;
  modoRegistroCategoria: boolean = false;
  filtroCategoriaId: number | null = null;
  @ViewChild('modalCategoria') modalCategoriaRef!: ElementRef;
  modalCategoriaInstance!: Modal;

  cargarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (res) => this.categorias = res.categorias || [],
      error: () => this.alertaService.mostrarMensaje('error', '¡Error!', 'No se pudieron cargar las categorías')
    });
  }

  registrarCategoria() {
    this.categoriaSeleccionada = { nombre: '' };
    this.modoRegistroCategoria = true;
    this.modalCategoriaInstance.show();
  }

  editarCategoria(categoria: any) {
    this.categoriaSeleccionada = { ...categoria };
    this.modoRegistroCategoria = false;
    this.modalCategoriaInstance.show();
  }

  cerrarModalCategoria() {
    if (this.modalCategoriaInstance) {
      this.modalCategoriaInstance.hide();
    }
    setTimeout(() => {
      this.categoriaSeleccionada = null;
      this.modoRegistroCategoria = false;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 300);
  }

  guardarCambiosCategoria() {
    const { id, ...dto } = this.categoriaSeleccionada;

    if (this.modoRegistroCategoria) {
      this.categoriaService.registrarCategoria(dto).subscribe({
        next: (res) => {
          this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje);
          this.cargarCategorias();
          this.cerrarModalCategoria();
        },
        error: (err) => this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje)
      });
    } else {
      this.categoriaService.actualizarCategoria(id, dto).subscribe({
        next: (res) => {
          this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje);
          this.cargarCategorias();
          this.cerrarModalCategoria();
        },
        error: (err) => this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje)
      });
    }
  }

  buscarCategoriaPorId() {
    if (!this.filtroCategoriaId || this.filtroCategoriaId <= 0) {
      this.alertaService.mostrarMensaje('error', 'Error', 'Ingrese un ID válido');
      return;
    }

    this.categoriaService.obtenerCategoriaPorId(this.filtroCategoriaId).subscribe({
      next: (res) => {
        // Si la respuesta tiene un objeto 'categoria' lo ponemos en la lista
        this.categorias = res.categoria ? [res.categoria] : [];
        if (this.categorias.length === 0) {
          this.alertaService.mostrarMensaje('success', 'Info', 'No se encontró la categoría');
        }
      },
      error: (err) => {
        this.alertaService.mostrarMensaje('error', 'Error', err.error?.mensaje || 'Categoría no encontrada');
        this.categorias = [];
      }
    });
  }

  eliminarCategoria(id: number) {
    this.alertaService.mostrarConfirmacion(
      '¿Eliminar categoría?',
      'Esta acción marcará la categoría como inactiva.',
      () => {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: (res) => {
            this.alertaService.mostrarMensaje('success', '¡Éxito!', res.mensaje);
            this.cargarCategorias();
          },
          error: (err) => this.alertaService.mostrarMensaje('error', '¡Error!', err.error?.mensaje)
        });
      }
    );
  }

}
