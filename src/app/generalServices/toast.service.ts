import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  /**
   * @description Displays a SweetAlert toast message.
   * @param message The message to display.
   * @param icon The icon to display ('success', 'error', 'info', etc.).
   */
  show(message: string, icon: 'success' | 'error' | 'info' | 'warning') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icon,
      title: message,
    });
  }
}
