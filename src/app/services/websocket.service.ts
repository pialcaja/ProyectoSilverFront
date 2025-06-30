import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import SockJS from 'sockjs-client/dist/sockjs';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Stomp.Client | null = null;

  conectar(): void {
    const socket = new SockJS('http://localhost:8091/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('WebSocket conectado');
    });
  }

  suscribirseARespuestas(callback: (respuesta: any) => void): void {
    this.stompClient?.subscribe('/topic/respuestas', mensaje => {
      const respuesta = JSON.parse(mensaje.body);
      callback(respuesta);
    });
  }

  desconectar(): void {
    this.stompClient?.disconnect(() => {
      console.log('WebSocket desconectado');
    });
  }
}
