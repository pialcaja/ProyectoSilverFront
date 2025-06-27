import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [NgIf],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loggedIn = false;

  ngOnInit() {
    this.authService.loggedIn$.subscribe(status => {
      this.loggedIn = status;
    });
  }

  logout() {
    this.authService.logout();
    this.loggedIn = false;
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }
}
