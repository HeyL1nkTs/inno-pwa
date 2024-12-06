import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import _ from 'lodash';
import { Status } from '../../../models/status.model';
import Cookies from 'js-cookie'
import Swal from 'sweetalert2';
import { MatIcon } from '@angular/material/icon';
import { MobileService } from '../../../generalServices/mobile.service';
import { CashierService } from '../../services/cashier.service';
import { InternetService } from '../../services/internet.service';
import { SocketService } from '../../../generalServices/socket.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css'
})
export class StatusBarComponent {

  status: boolean = false;
  current_amount: number = 0;
  initial_amount: number = 0;
  cashier_id: number;
  sliderIcon: string = 'arrow_circle_up';
  preventReload: boolean = false; //updates socket conn
  @Output() openMenu = new EventEmitter<boolean>();

  //TODO Delete the following line
  cardData: any = [];


  constructor(private mobileService: MobileService,
    private cashier: CashierService,
    private connection: InternetService,
    private socket: SocketService) { }

  ngOnInit() {
    Cookies.get('status') === 'true' ? this.status = true : this.status = false;
    if (localStorage.getItem('orders')) {
      this.cardData = JSON.parse(localStorage.getItem('orders'));
      this.sortOrders();
      this.updateCurrentAmmount();
    }
    if (localStorage.getItem('isConnected') === '1') {
      this.preventReload = true;
      localStorage.removeItem('isConnected');
    }
    const cashier = Cookies.get('cashier');
    if (cashier) {
      this.cashier_id = JSON.parse(cashier)._id;
      this.initial_amount = JSON.parse(cashier).initial_amount;
    }

    if (this.preventReload) {
      this.getConnection();
    }
  }

  getConnection() {
    localStorage.setItem('isConnected', '1');
    this.socket.connect();
    this.socket.listenForPaymentInfo().subscribe((order) => {
      order.date = this.formatDate(new Date(order.date));
      this.cardData.push(order);
      this.sortOrders();
      this.reloadPrevention();
      this.updateCurrentAmmount();
    });
  }

  reloadPrevention() {
    localStorage.removeItem('orders');
    localStorage.setItem('orders', JSON.stringify(this.cardData));
  }

  statusDay() {

    if (!this.connection.isOnlineStatus()) {
      Swal.fire({
        icon: 'error',
        title: 'Necesitas estar conectado a internet para iniciar el día',
      })
      return;
    }

    if (_.isEqual(this.status, true)) {
      Swal.fire({
        icon: 'warning',
        title: 'Cerraras la venta del día',
        text: 'Esto cerrara la caja y no podras seguir vendiendo, se cerraraan las cuentas vendedor',
        confirmButtonColor: 'green',
        confirmButtonText: 'Close',
        showCancelButton: true,
        cancelButtonColor: 'red',
        cancelButtonText: 'Cancel'
      }).then((response) => {
        if (response.isConfirmed) {
          this.cashier.closeCashier(this.cashier_id).subscribe((res) => {
            Cookies.set('status', 'false');
            Cookies.remove('cashier');
            Swal.fire({
              icon: 'success',
              title: 'Caja cerrada',
              text: `Generaste $ ${this.current_amount} hoy! Buenas Noches :D`
            }).then(() => {
              this.closeCashier();
              this.status = false;
              this.cashier_id = null;
            })
          })
        }
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Iniciaras la venta del día',
        confirmButtonColor: 'green',
        confirmButtonText: 'Start',
        showCancelButton: true,
        cancelButtonColor: 'red',
        cancelButtonText: 'Cancel'
      }).then((response) => {
        if (response.isConfirmed) {
          let dbStatus = {
            status: 'open',
          };
          this.cashier.openCashier(JSON.stringify(dbStatus)).subscribe((res) => {
            Cookies.set('status', 'true');
            Cookies.set('cashier', JSON.stringify(res));
            this.status = true;
            this.cashier_id = res._id;
            this.getConnection();
            Swal.fire({
              icon: 'success',
              title: 'Que tengas muy buen dia :D',
            })
          })
        }
      })
    }
  }

  updateCurrentAmmount() {
    this.cardData.forEach(order => {
      this.current_amount += order.total
    });
  }

  closeCashier() {
    this.current_amount = 0;
    this.cardData = [];
    localStorage.removeItem('orders');
    this.socket.endConnection();
  }

  /**
   * @description Formats a Date object into a string in the format dd-mm-yyyy hh:mm:ss
   *
   * @param date - The Date object to format
   * @returns A string representing the formatted date
   */
  formatDate(date: Date): string {
    const pad = (num: number) => (num < 10 ? '0' + num : num); // Helper function to pad single digits
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  toogleIcon() {
    if (this.mobileService.checkScreenSize()) {
      if (_.isEqual(this.sliderIcon, 'arrow_circle_up')) {
        this.sliderIcon = 'arrow_circle_down';
        this.openMenu.emit(true);
      } else {
        this.sliderIcon = 'arrow_circle_up';
        this.openMenu.emit(false);
      }
    }
  }

  /**
  * Ordena las órdenes en el array, colocando la más reciente arriba y elimina ordenes con id iguales
  */
  sortOrders(): void {
    this.cardData.sort((a, b) => {
      const dateA = new Date(a.date).getTime(); // Usar objeto Date para comparación
      const dateB = new Date(b.date).getTime(); // Usar objeto Date para comparación
      return dateB - dateA; // Ordenar de más reciente a más antiguo
    });

    this.cardData = _.uniqBy(this.cardData, 'orderNumber');
  }
}
