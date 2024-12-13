import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  url = environment.url + "sale/dashboard";

  constructor(private http: HttpClient) {}

  getDashboard(type: string) {
    return firstValueFrom(this.http.get(this.url+ '/' +type));
  }

}
