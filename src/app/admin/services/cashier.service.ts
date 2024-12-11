import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CashierService {

  private url: string = `${environment.url}`;
  private module: string = 'cashier';
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  constructor(private http: HttpClient) { }

  openCashier(body: string): Observable<any> {
    return this.http.post<any>(this.url + this.module + '/open', body, { headers: this.headers });
  }

  closeCashier(id: number): Observable<any> {
    return this.http.delete<any>(this.url + this.module + '/close/' + id);
  }

  checkCashierStatus() {
    return firstValueFrom(this.http.get<any>(this.url + this.module + '/exist'));
  }
}
