import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tema, Respuesta } from '../models/tema.model';
import { Observable } from 'rxjs';

/*foro*/
@Injectable({ providedIn: 'root' })
export class ForoService {
  private baseUrl = 'http://localhost:8091/api/foro';

  constructor(private http: HttpClient) { }

  listarTemas(): Observable<Tema[]> {
    return this.http.get<Tema[]>(`${this.baseUrl}/lista`);
  }

  verTema(id: number): Observable<Tema> {
    return this.http.get<Tema>(`${this.baseUrl}/temas/${id}`);
  }

  crearTema(tema: Partial<Tema>): Observable<Tema> {
    return this.http.post<Tema>(`${this.baseUrl}/crear`, tema);
  }

  agregarRespuesta(temaId: number, respuesta: Partial<Respuesta>): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.baseUrl}/addRespuestas/${temaId}`, respuesta);
  }
}
