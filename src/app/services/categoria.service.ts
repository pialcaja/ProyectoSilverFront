import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly apiUrl = 'http://localhost:8091/api/categorias';

  constructor(private http: HttpClient) { }

  listarCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listado`);
  }

  obtenerCategoriaPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/listado/${id}`);
  }

  registrarCategoria(categoria: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, categoria);
  }

  actualizarCategoria(id: number, categoria: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizacion/${id}`, categoria);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

}
