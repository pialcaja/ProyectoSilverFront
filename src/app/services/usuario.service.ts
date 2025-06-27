import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = 'http://localhost:8091/api/usuario';

  constructor(private http: HttpClient) { }

  registrar(usuario: { nombre: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }

  listarUsuarios(
    estado: 'ACTIVO' | 'INACTIVO',
    rol?: string,
    page: number = 0,
    size: number = 5,
    textoBusqueda: string = ''
  ): Observable<any> {
    const estadoBackend = estado === 'ACTIVO' ? 'A' : 'I';

    let params: any = { estado: estadoBackend, page, size };
    if (rol) params.rol = rol;
    if (textoBusqueda && textoBusqueda.trim() !== '') {
      params.textoBusqueda = textoBusqueda;
    }

    return this.http.get(`${this.apiUrl}/listado`, { params });
  }

  actualizarUsuario(usuario: any) {
    const { id, ...dto } = usuario;
    return this.http.put(`${this.apiUrl}/actualizacionAdmin/${id}`, dto);
  }

  actualizarUsuarioAdmin(usuario: any) {
    return this.http.put(`${this.apiUrl}/actualizacionAdmin/${usuario.id}`, usuario);
  }

  desactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/desactivacion/${id}`, {});
  }

  reactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivacion/${id}`, {});
  }
}
