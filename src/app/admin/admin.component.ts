import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './html/navbar/navbar.component';
import { MenuComponent } from './html/menu/menu.component';
import { StatusBarComponent } from './html/status-bar/status-bar.component';
import { SocketService } from '../generalServices/socket.service';
import { ToastActions } from '../generalServices/toast-actions.interface';
import { ToastService } from '../generalServices/toast.service';
import { IndexDbService } from '../pwa/index.db.service';
import { InternetService } from './services/internet.service';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, MenuComponent, StatusBarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  openMenu: boolean = false;

  constructor(private socket: SocketService, private indexDbService: IndexDbService, private toast: ToastService, private internet: InternetService) {
    this.socket.connect();
    try{
      this.internet.isOnline.subscribe((status) => {
        if(status){
          this.toast.show('Estas en linea', ToastActions.INFO);
        } else {
          this.toast.show('Estas fuera de linea', ToastActions.INFO);
        }
      });
    } catch (error){
      console.error('Error initializing databases', error);
    }
  }

  ngOnInit() {}

  openDashboard(open: boolean) {
    const menu = document.getElementById('status-bar');
    if (open) {
      menu.style.top = '0%';
    } else {
      menu.style.top = '94%';
    }
  }
}
