import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideojuegoService {
  private readonly apiUrl = 'http://localhost:8091/api/videojuegos';

  constructor(private http: HttpClient) { }

  listarVideojuegos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lista`);
  }

  buscarVideojuegoPorNombre(nombre: string): Observable<any> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  buscarVideojuegoPorEstado(estados: string[]): Observable<any> {
    const params = new HttpParams().set('estados', estados.join(','));
    return this.http.get(`${this.apiUrl}/estado`, { params });
  }

  buscarVideojuegoPorCategoria(categoriaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  buscarVideojuegoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  registrarVideojuego(videojuego: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, videojuego);
  }

  actualizarVideojuego(id: number, videojuego: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, videojuego);
  }

  eliminarVideojuego(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/eliminar/${id}`, {});
  }
}
