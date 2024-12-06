import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { IndexDbService } from '../../pwa/index.db.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private url: string = `${environment.url}`;
  private module: string = 'catalog';

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  constructor(private http: HttpClient, private idb: IndexDbService) { }

  /**
   * @description Get items from catalog
   * @param catalog
   * @param param structure : name=value&name=value
   * @returns catalog
   */
  public async getItems(catalog: string, param: string): Promise<any> {

    let data;

    if (navigator.onLine) {
      await this.idb.clearTable(catalog);
      if (param) {
        data = await firstValueFrom(this.http.get<any[]>(this.url + this.module + '/' + catalog + '?' + param));
        await this.idb.saveInformation(catalog, data);
        return data;
      }
      data = await firstValueFrom(this.http.get<any[]>(this.url + this.module + '/' + catalog));
      await this.idb.saveInformation(catalog, data);
      return data;
    } else {
      return await this.idb.getItems(catalog);
    }
  }

  /**
   * @description Set items in catalog
   * @param catalog supply, product, combo
   * @param item item to be added
   * @returns item added
   */
  public async setItems(catalog: string, item: any): Promise<any> {
    if (navigator.onLine) {
      if (item instanceof FormData) {
        return await firstValueFrom(this.http.post(this.url + this.module + '/' + catalog, item)); // example  http://localhost:3032/catalog/supply
      } else {
        return await firstValueFrom(this.http.post(this.url + this.module + '/' + catalog, item, { headers: this.headers })); // example  http://localhost:3032/catalog/supply
      }
    } else {

      const data = item instanceof FormData ? await this.idb.serializeRequestBody(item) : item;

      const request = {
        url: this.url + this.module + '/' + catalog,
        method: 'POST',
        body: data,
        type: item instanceof FormData ? 'formdata' : 'json',
      };

      try {
        if (await this.idb.addRequestToQueue(request)) {
          return { message: 'Request added to queue, it will process when you have Internet', success: true, item: item };
        } else {
          throw new Error('Failed to add request to queue');
        }
      } catch (error) {
        console.error('Error saving information offline:', error);
        throw new Error('Failed to save data offline');
      }
    }
  }

  /**
   * @param catalog
   * @param item item to be updated
   * @param action stock
   * @returns itemn updated
   */
  public async updateStock(catalog: string, item: any, action: string, id: string): Promise<any> {
    if (navigator.onLine) {
      return await firstValueFrom(this.http.put(this.url + this.module + '/' + catalog + '/' + action + '/' + id, item, { headers: this.headers })); // example  http://localhost:3032/catalog/supply/stock/1
    } else {

      const request = {
        url: this.url + this.module + '/' + catalog + '/' + action + '/' + id,
        method: 'PUT',
        body: item,
      };

      try {
        if (await this.idb.addRequestToQueue(request)) {
          return { message: 'Request added to queue, it will process when you have Internet', success: true, item: item };
        }
      } catch (error) {
        console.error('Error saving information offline:', error);
        throw new Error('Failed to save data offline');
      }
    }
  }

  /**
   * @description Delete item from catalog
   * @param catalog
   * @param id item id
   * @returns item deleted
   */
  public async deleteItem(catalog: string, id: number): Promise<any> {
    if (navigator.onLine) {
      return await firstValueFrom(this.http.delete(this.url + this.module + '/' + catalog + '/' + id)); // example  http://localhost:3032/catalog/supply/1
    } else {
      const request = {
        url: this.url + this.module + '/' + catalog + '/' + id,
        method: 'DELETE',
      };

      try {
        if (this.idb.addRequestToQueue(request)) {
          return { message: 'Request added to queue, it will process when you have Internet', success: true, item: id };
        }
      } catch (error) {
        console.error('Error saving information offline:', error);
        throw new Error('Failed to save data offline');
      }
    }
  }

  public async updateItem(catalog: string, item: any, id: string): Promise<any> {
    if (navigator.onLine) {
      if (item instanceof FormData) {
        return await firstValueFrom(this.http.put(this.url + this.module + '/' + catalog + '/' + id, item)); // example  http://localhost:3032/catalog/supply/1
      } else {
        return await firstValueFrom(this.http.put(this.url + this.module + '/' + catalog + '/' + id, item, { headers: this.headers })); // example  http://localhost:3032/catalog/supply/1
      }
    } else {

      const data = item instanceof FormData ? await this.idb.serializeRequestBody(item) : item;

      const request = {
        url: this.url + this.module + '/' + catalog + '/' + id,
        method: 'PUT',
        body: data,
        type: item instanceof FormData ? 'formdata' : 'json',
      }

      try {
        if (await this.idb.addRequestToQueue(request)) {
          return { message: 'Request added to queue, it will process when you have Internet', success: true, item: item };
        }
      } catch (error) {
        console.error('Error saving information offline:', error);
        throw new Error('Failed to save data offline');
      }
    }
  }
}

