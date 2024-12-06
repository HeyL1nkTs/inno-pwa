import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { InternetService } from '../../services/internet.service';
import { JwtService } from '../../../generalServices/jwt.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  isAdmin: boolean = false;
  menu: any[] = [];

  constructor(public internet: InternetService, public jwt: JwtService) { }

  ngOnInit() {
    const user = this.jwt.getPayloadWithtokenStorage();
    this.isAdmin = user.role === 'admin' ? true : false;
    this.fillMenu();
  }

  fillMenu() {
    if (this.isAdmin) {
      this.menu = [
        { name: 'Dashboard', icon: 'home', url: '/admin/dashboard' },
        { name: 'Supplies', icon: 'category', url: '/admin/catalog/supplies' },
        { name: 'Products', icon: 'shopping_cart', url: '/admin/catalog/products' },
        { name: 'Combo', icon: 'stars', url: '/admin/catalog/combos' },
        { name: 'Extras', icon: 'add_circle', url: '/admin/extras' },
        { name: 'Queue', icon: 'list_alt_check', url: '/admin/request' },
        { name: 'Users', icon: 'people', url: '/admin/users' },
      ]
    }
  }

}
