import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Cookies from 'js-cookie'
import { JwtService } from '../../../generalServices/jwt.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { LoadingComponent } from '../../../generalServices/loading/loading.component';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private jwt: JwtService) { }

  async ngOnInit() {
    await this.closeSession();
  }

  async closeSession() {
    try {
      console.log('cerrada la sesion');
      localStorage.removeItem('token');
      localStorage.removeItem('isConnected');
      localStorage.removeItem('orders');
      localStorage.removeItem('cashier');
      Cookies.remove('cashier');
      Cookies.remove('status');
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Hasta luego!'
        }).then(() => {
          this.router.navigate(['/auth']);
        })
      })
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se pudo cerrar session'
      }).then(() => {
        this.router.navigate(['/']);
      });
    }
  }

}
