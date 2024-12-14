import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../admin/html/navbar/navbar.component';
import { MenuComponent } from '../admin/html/menu/menu.component';
import { SocketService } from '../generalServices/socket.service';
import Swal from 'sweetalert2';
import { InternetService } from '../admin/services/internet.service';
import { ToastActions } from '../generalServices/toast-actions.interface';
import { ToastService } from '../generalServices/toast.service';
import { IndexDbService } from '../pwa/index.db.service';
import { JwtService } from '../generalServices/jwt.service';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, MenuComponent],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
  constructor(private socket: SocketService, private router: Router,
    private toast: ToastService, private internet: InternetService,
    private idb: IndexDbService, private jwt: JwtService, private authService: AuthService
  ) {
    this.listeningAdmin();
    try {
      this.internet.isOnline.subscribe((status) => {
        if (!status) {
          this.toast.show('Estas fuera de linea, puedes continuar trabajando', ToastActions.INFO);
        } else {
          this.idb.processQueueSeller();
          this.toast.show('Se procesaron las solicitudes.!', ToastActions.INFO);
        }
      });
    } catch (error) {
      console.error('Error initializing databases', error);
    }
  }

  listeningAdmin() {
    this.socket.listenForAdminLogout().subscribe(() => {
      Swal.fire({
        title: 'Sesión finalizada',
        text: 'Haz terminado tu jornada, buen dia..! :D',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(async () => {
        if (this.jwt.isAuthenticated()) {
          const user = this.jwt.getPayload(localStorage.getItem('token'));
          await this.authService.logout(user);
          localStorage.removeItem('token');
          this.router.navigate(['/auth/logout']);
        }
        this.socket.endConnection();
      })
    });
  }
}
