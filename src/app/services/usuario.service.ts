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

  listarUsuarios(estado: 'ACTIVO' | 'INACTIVO', rol?: string): Observable<any> {
    const estadoBackend = estado === 'ACTIVO' ? 'A' : 'I';

    let params: any = { estado: estadoBackend };
    if (rol) {
      params.rol = rol;
    }

    return this.http.get(`${this.apiUrl}/listado`, { params });
  }

  actualizarUsuario(usuario: any) {
    return this.http.put(`${this.apiUrl}/actualizacion/${usuario.id}`, usuario);
  }

  desactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/desactivacion/${id}`, {});
  }

  reactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivacion/${id}`, {});
  }
}
