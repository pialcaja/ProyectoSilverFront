import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogoService } from '../../services/catalogo.service';
import { FormsModule } from '@angular/forms';
import { SafePipe } from './safe.pipe';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
    selector: 'app-catalogo',
    standalone: true,
    imports: [CommonModule, FormsModule, SafePipe],
    templateUrl: './catalogo.component.html',
    styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
    videojuegos: any[] = [];
    categorias: any[] = [];
    categoriaSeleccionada: number = 0;
    videojuegoSeleccionado: any = null;
    modalAbierto: boolean = false;
    loggedIn = false;

    trailers: { [key: string]: string } = {
        'God of War': 'K0u_kAWLJOA',
        'NBA 2K24': 'V-Ns4r77lro',
        'StarCraft II': 'VJv4Q2UekO4',
        'Persona 5': 'QnDzJ9KzuV4',
        'Mortal Kombat 11': '9voVoqj2_ts',
        'Hollow Knight': 'UAO2urG23S4',
        'Gran Turismo 7': '1tBUsXIkG1A',
        'Total War: WARHAMMER III': 'q82sxIbp-Bk',
        'The Witcher 3: Wild Hunt': 'c0i88t0Kacs',
        'Call of Duty: Modern Warfare II': '7el5VW1wij0',
        'DOOM Eternal': 'qgvV4GE8vVA',
        'The Legend of Zelda: Breath of the Wild': 'zw47_q9wbBE',
        'Uncharted 4: A Thief\'s End': 'hh5HV4iic1Y',
        'Final Fantasy VII Remake': 'ERgrFVhL-n4',
        'Cyberpunk 2077': 'rViiAA3qs50',
        'Resident Evil 4 Remake': 'j5Ic2z3_xp0'
    };

    constructor(
        private catalogoService: CatalogoService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarCategorias();
        this.cargarVideojuegos();
    }

    cargarCategorias(): void {
        this.catalogoService.listarCategorias().subscribe({
            next: (res) => this.categorias = res.categorias,
            error: (err) => console.error('Error al cargar categorías', err)
        });
    }

    cargarVideojuegos(): void {
        this.catalogoService.listarVideojuegos().subscribe({
            next: (res) => this.videojuegos = res.videojuegos.filter((vj: any) => vj.estado === 'A'),
            error: (err) => console.error('Error al cargar videojuegos', err)
        });
    }

    filtrarPorCategoria(): void {
        if (this.categoriaSeleccionada === 0) {
            this.cargarVideojuegos();
        } else {
            this.catalogoService.listarPorCategoria(this.categoriaSeleccionada).subscribe({
                next: (res) => this.videojuegos = res.videojuegos.filter((vj: any) => vj.estado === 'A'),
                error: (err) => {
                    this.videojuegos = [];
                    console.error('Error al filtrar por categoría', err);
                }
            });
        }
    }

    getRutaImagen(id: number): string {
        return `assets/videojuegos/${id}.jpg`;
    }

    onImageError(event: Event): void {
        (event.target as HTMLImageElement).src = 'assets/videojuegos/default.jpg';
    }

    abrirModal(id: number): void {
        this.catalogoService.obtenerDetalle(id).subscribe({
            next: (res) => {
                this.videojuegoSeleccionado = res.videojuego;
                this.modalAbierto = true;

                const modal = document.getElementById('detalleModal');
                if (modal) {
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();

                    modal.addEventListener(
                        'hidden.bs.modal',
                        () => {
                            this.modalAbierto = false;
                            this.videojuegoSeleccionado = null;
                        },
                        { once: true }
                    );
                }
            },
            error: (err) => {
                console.error('Error al cargar detalle del videojuego', err);
            }
        });
    }

    getTrailerEmbedUrl(nombre: string): string {
        const id = this.trailers[nombre] || 'dQw4w9WgXcQ';
        return `https://www.youtube.com/embed/${id}`;
    }

    logout() {
        this.authService.logout();
        this.loggedIn = false;
    }

    irAlLogin() {
        this.router.navigateByUrl('/login');
    }
}
