import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  mostrarMensaje(icon: 'success' | 'error', titulo: string, texto: string) {
    Swal.fire({
      icon,
      title: titulo,
      text: texto,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0dcaf0',
      background: '#212529',
      color: '#f8f9fa'
    });
  }

  mostrarConfirmacion(titulo: string, texto: string, confirmCallback: () => void) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      background: '#212529',
      color: '#f8f9fa'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmCallback();
      }
    });
  }
}