import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IndexDbService } from '../../pwa/index.db.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private urlProd: string = `${environment.url}catalog/products/client`;
  private urlCombo: string = `${environment.url}catalog/combos/client`;
  private urlSale: string = `${environment.url}sale`;

  constructor(private http: HttpClient, private idb: IndexDbService) { }

  async getProducts(): Promise<any[]> {
    if(navigator.onLine){
      await this.idb.clearTable('products');
      const data = await firstValueFrom(this.http.get<any[]>(this.urlProd));
      await this.idb.saveInformation('products', data);
      return data;
    } else {
      return await this.idb.getItems('products');
    }
  }

  async getCombos(): Promise<any[]> {
    if(navigator.onLine){
      await this.idb.clearTable('combos');
      const data = await firstValueFrom(this.http.get<any[]>(this.urlCombo));
      await this.idb.saveInformation('combos', data);
      return data;
    } else {
      return await this.idb.getItems('combos');
    }
  }

  async setOrder(order: any): Promise<any> {
    if(navigator.onLine){
      return await firstValueFrom(this.http.post<any>(this.urlSale+'/order', order));
    } else {
      const request = {
        url: this.urlSale+'/order',
        method: 'POST',
        body: JSON.stringify(order)
      };

      try{
        if(await this.idb.addRequestToQueueSeller(request)) {
          return { message: 'Se agrego a la cola, se procesara en cuanto haya internet', success: true, item: order };
        } else{
          throw new Error('Failed to add request to queue');
        }
      } catch(error) {
        console.error('Error saving information offline:', error);
        throw new Error('Failed to save data offline');
      }
    }
  }

}
