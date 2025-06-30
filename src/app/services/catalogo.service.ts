import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CatalogoService {
    private baseUrl = 'http://localhost:8091/api/catalogo';

    constructor(private http: HttpClient) { }

    listarVideojuegos(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/listado`);
    }

    listarPorCategoria(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/categoria/${id}`);
    }

    listarCategorias(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/categorias`);
    }

    obtenerDetalle(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/listado/${id}`);
    }


}
