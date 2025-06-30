import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForoService } from '../../services/foro.service';
import { WebSocketService } from '../../services/websocket.service';
import { Tema, Respuesta } from '../../models/tema.model';



@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foro.component.html',
  styleUrls: ['./foro.component.css'],

})
export class ForoComponent implements OnInit {
  temas: Tema[] = [];
  nuevoTema: Partial<Tema> = {};
  nuevasRespuestas: { [key: number]: string } = {};
  loggedIn = false;
  router: any;
  authService: any;

  constructor(private foroService: ForoService, private wsService: WebSocketService) { }

  ngOnInit(): void {
    this.cargarTemas();



    this.wsService.suscribirseARespuestas((respuesta: Respuesta) => {
      const tema = this.temas.find(t => t.id === respuesta.temaId);
      if (tema) {
        tema.respuestas.push(respuesta);
      }
    });
  }

  cargarTemas(): void {
    this.foroService.listarTemas().subscribe(data => {
      this.temas = data;
    });
  }

  crearTema(): void {
    console.log('📨 Crear tema:', this.nuevoTema);
    if (!this.nuevoTema.titulo || !this.nuevoTema.contenido) return;

    this.foroService.crearTema(this.nuevoTema).subscribe(nuevo => {
      this.temas.unshift({ ...nuevo, respuestas: [] });
      this.nuevoTema = {};
    });
  }


  responder(temaId: number): void {
    const contenido = this.nuevasRespuestas[temaId];
    if (!contenido) return;

    this.foroService.agregarRespuesta(temaId, { contenido }).subscribe(() => {
      this.nuevasRespuestas[temaId] = '';
    });
  }




  logout() {
    this.authService.logout();
    this.loggedIn = false;
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }

  mostrarFormulario = false;


}
