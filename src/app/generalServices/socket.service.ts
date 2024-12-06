import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Conectar al servidor de Socket.IO
    this.socket = io(environment.socket);
  }

  /**
   * @description Connect to the socket server
   */
  connect() {
    this.socket.connect();
  }

  /**
   * @description Escucha los datos de paymentInfo enviados desde el servidor
   * @returns Observable con los datos de paymentInfo
   */
  listenForPaymentInfo(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('paymentInfo', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.off('paymentInfo');
      };
    });
  }

  /**
   * @description Escucha si finalizo la sesion el admin
   */
  listenForAdminLogout(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('closeSession', () => {
        observer.next();
      });

      return () => {
        this.socket.off('closeSession');
      };
    });
  }

  /**
   * @description end the socket connection
   */

  endConnection() {
    this.socket.disconnect();
  }
}
