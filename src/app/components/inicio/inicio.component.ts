import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loggedIn = false;

  imagenes = Array.from({ length: 8 }, (_, i) => i + 1); // del 1 al 8
  visibles = 4;
  indice = 0;
  imagenesMostradas: number[] = [];

  ngOnInit() {
    this.authService.loggedIn$.subscribe(status => {
      this.loggedIn = status;
    });
    this.actualizarCarrusel();
  }

  logout() {
    this.authService.logout();
    this.loggedIn = false;
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }

  actualizarCarrusel() {
    this.imagenesMostradas = this.imagenes.slice(this.indice, this.indice + this.visibles);
  }

  moverDerecha() {
    if (this.indice + this.visibles < this.imagenes.length) {
      this.indice += this.visibles;
    } else {
      this.indice = 0; // reiniciar al comienzo
    }
    this.actualizarCarrusel();
  }

  moverIzquierda() {
    if (this.indice - this.visibles >= 0) {
      this.indice -= this.visibles;
    } else {
      this.indice = Math.max(0, this.imagenes.length - this.visibles);
    }
    this.actualizarCarrusel();
  }

  irACatalogo() {
    this.router.navigate(['/catalogo']);
  }
}
