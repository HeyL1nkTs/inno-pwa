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
import { JwtService } from '../../../generalServices/jwt.service';

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

  cardData: any = [];


  constructor(private mobileService: MobileService,
    private cashier: CashierService,
    private connection: InternetService,
    private socket: SocketService,
    private jwt: JwtService) { }

  async ngOnInit() {

    this.socket.connect(); // Conectar al servidor de Socket.IO
    /*
      Check if there is a cashier open, if there is, set the status to true
    */
    const cashier = await this.getActualCashier();
    if (cashier.cashierStatus === 'open') {
      console.log('Caja abierta', cashier);
      this.openCashier(cashier);
      Swal.fire({
        icon: 'success',
        title: 'Se encontro una caja abierta'
      });
    } else { //si esta cerrada me suscribo al evento de caja abierta
      this.listenOpenCashier();
    }
  }

  async getActualCashier() {
    const cashier = await this.cashier.checkCashierStatus();
    return cashier;
  }

  getConnection() {
    this.socket.listenForPaymentInfo().subscribe((data) => {
      if (data) {
        console.log('Data from socket', data);
        const order = data.paymentInfo;
        const currentTotal = data.currentAmount;
        this.current_amount = currentTotal;
        const parsedDate = new Date(order.date);
        order.date = isNaN(parsedDate.getTime())
          ? this.formatDate(new Date()) // Si la fecha es inválida, usar la fecha actual
          : this.formatDate(parsedDate); // Si es válida, formatear la fecha original
        order.temp = this.generateTemporalOrderNumber(order.orderNumber);
        this.cardData.push(order);
        this.cardData = this.consolidateOrders();
      }
    });
  }

  generateTemporalOrderNumber(orderNumber) {

    if(_.isEmpty(orderNumber)) {
      return this.ifObjectIdDoesNotExist();
    }

    const first = orderNumber.slice(0, 3);
    const second = orderNumber.slice(-3);

    return first + second;
  }

  ifObjectIdDoesNotExist() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < 6; i++) {
      randomId += chars[Math.floor(Math.random() * chars.length)];
    }
    return randomId;
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
        text: 'Esto cerrara la caja y no podras seguir vendiendo, se cerraran las cuentas vendedor',
        confirmButtonColor: 'green',
        confirmButtonText: 'Close',
        showCancelButton: true,
        cancelButtonColor: 'red',
        cancelButtonText: 'Cancel'
      }).then((response) => {
        if (response.isConfirmed) {
          this.cashier.closeCashier(this.cashier_id).subscribe((res) => {
            Swal.fire({
              icon: 'success',
              title: 'Caja cerrada',
              text: `Generaste $ ${this.current_amount} hoy!`
            }).then(() => {
              this.closeCashierData();
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
            Swal.fire({
              icon: 'success',
              title: 'Bienvenido!',
            }).then(() => {
              this.openCashier(res);
            })
          })
        }
      })
    }
  }

  openCashier(data) { //al iniciar la app
    this.status = true; //la caja esta abierta
    this.cashier_id = data.cashierId; //guardo el id de la caja
    this.current_amount = data.current_amount; //guardo el monto actual
    this.getConnection(); //me suscribo a las ordenes
    this.listenCloseCashier(); //me suscribo al evento de cierre de caja por algun otro admin
  }

  closeCashierData() {
    this.cashier_id = null;
    this.status = false;
    this.current_amount = 0;
    this.cardData = [];
  }

  listenOpenCashier() {
    this.socket.onOpenCashier().subscribe((data: any) => {
      if (data) {
        Swal.fire({
          icon: 'info',
          title: 'Caja abierta por otro admin',
        }).then(() => {
          this.openCashier(data);
        })
      }
    });
  }

  listenCloseCashier() {
    this.socket.onCloseCashier().subscribe((shouldClose: boolean) => {
      if (shouldClose) {
        Swal.fire({
          icon: 'info',
          title: 'Caja cerrada por otro admin',
          text: 'Hoy generaste $' + this.current_amount
        }).then(() => {
          this.closeCashierData(); // Lógica para manejar el cierre de la caja
        })
      }
    });
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

  consolidateOrders() {
    const consolidatedOrders = _.uniqBy(this.cardData, 'orderNumber');
    return consolidatedOrders;
  }

  ngOnDestroy() {
    this.socket.endConnection();
  }
}
