import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MobileService } from '../../../generalServices/mobile.service';
import { JwtService } from '../../../generalServices/jwt.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  currentDate: string = "";
  currentTime: string = "";
  isMobileScreen: boolean = false;
  isMenuOpen: boolean = false;
  user: any;
  isAdmin: boolean = false;

  constructor(private movileService: MobileService, private jwt: JwtService) {
    setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnInit() {
    this.isMobileScreen = this.movileService.checkScreenSize() ? true : false;
    this.user = this.jwt.getPayloadWithtokenStorage();
    this.isAdmin = this.user.role === 'admin' ? true : false;
  }

  updateDateTime(): void {
    const now = new Date();

    // Obtener la fecha en el formato '12 de Junio de 2024'
    this.currentDate = this.formatDate(now);

    // Obtener la hora en el formato '18:30'
    this.currentTime = this.formatTime(now);
  }

  // Función para formatear la fecha
  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = this.getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  }

  // Función para formatear la hora
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Función para obtener el nombre del mes en español
  private getMonthName(monthIndex: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
      'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex];
  }

  mobileMenu(): void {
    if (this.isMobileScreen) {
      const menu = document.getElementById('opc');

      if (!menu) {
        console.error("Menu element not found");
        return;
      }
      console.log(this.isMenuOpen);
      if (this.isMenuOpen) {
        // Close menu
        menu.classList.remove('open-menu');
        setTimeout(() => {
          menu.classList.add('close-menu');
        }, 500); // Tiempo para animación de cierre
        this.isMenuOpen = false;
      } else {
        // Open menu
        menu.classList.remove('close-menu'); // Asegúrate de quitar cualquier clase previa
        menu.classList.add('open-menu');
        this.isMenuOpen = true;
      }
    }
  }
}
