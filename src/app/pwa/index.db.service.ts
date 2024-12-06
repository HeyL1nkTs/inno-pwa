import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import { firstValueFrom } from 'rxjs';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {

  public dbName: string = 'main-idb';
  public requestStoreName: string = 'requestQueue';
  public requestStoreSellerName: string = 'requestQueueSeller';
  public transactionStoreName: string = 'queue';
  public transactionStoreSellerName: string = 'queueSeller';
  private isProcessingQueue = false; // Variable de bloqueo

  constructor(private http: HttpClient,) { }

  public async initializeDataBases(catalogs: string[]) {
    await openDB(this.dbName, 1, {
      upgrade(db) {
        for (const catalog of catalogs) {
          if (!db.objectStoreNames.contains(catalog)) {
            db.createObjectStore(catalog, { keyPath: '_id', autoIncrement: true });
          }
        }
        // Crear el object store para la cola de solicitudes
        if (!db.objectStoreNames.contains('requestQueue')) {
          db.createObjectStore('requestQueue', { keyPath: '_id', autoIncrement: true });
        }

        // Crear el object store para la cola de solicitudes de vendedor
        if (!db.objectStoreNames.contains('requestQueueSeller')) {
          db.createObjectStore('requestQueueSeller', { keyPath: '_id', autoIncrement: true });
        }
      }
    });
  }

  async getItems(catalog: string) {
    const db = await openDB(this.dbName, 1);
    const tx = db.transaction(catalog, 'readonly');
    const store = tx.objectStore(catalog);
    return store.getAll();
  }

  /**
   * @description Sabes chunks of information in the indexedDB
   */
  async saveInformation(catalog: string, data: any[]): Promise<any> {
    try {
      const db = await openDB(this.dbName, 1);
      const tx = db.transaction(catalog, 'readwrite');
      const store = tx.objectStore(catalog);

      for (const item of data) {
        await store.put(item);
      }

      await tx.done;

      // Retornar el elemento guardado
      return { success: true, message: 'Data saved successfully' };
    } catch (error) {
      console.error('Error saving information offline:', error);

      // Lanza el error para que pueda ser manejado en el lugar donde se llama
      throw new Error('Failed to save data offline');
    }
  }

  /**
   * @description Save a single item in the indexedDB
   */
  async saveItem(catalog: string, item: any): Promise<any> {
    try {
      const db = await openDB(this.dbName, 1);
      const tx = db.transaction(catalog, 'readwrite');
      const store = tx.objectStore(catalog);
      if (!item._id) {
        item._id = Date.now().toString(); // Genera un ID único temporal si no existe
      }
      await store.put(item);
      await tx.done;
      return item;
    } catch (error) {
      console.log("Hubo error en saveItem")
      console.error('Error saving information offline:', error);
      throw new Error('Failed to save data offline');
    }
  }

  async clearTable(catalog: string) {
    const db = await openDB(this.dbName, 1);
    const tx = db.transaction(catalog, 'readwrite');
    const store = tx.objectStore(catalog);
    await store.clear();
    await tx.done;
  }

  async clearTables(catalogs: string[]) {
    const db = await openDB(this.dbName, 1);
    for (const catalog of catalogs) {
      const tx = db.transaction(catalog, 'readwrite');
      const store = tx.objectStore(catalog);
      await store.clear();
      await tx.done;
    }
  }

  //REQUESTQUE PETITIONS
  // Agregar una solicitud a la cola
  async addRequestToQueue(request: any): Promise<boolean> {
    try {
      const db = await openDB(this.dbName);
      const tx = db.transaction(this.requestStoreName, 'readwrite');
      const store = tx.objectStore(this.requestStoreName);
      await store.add(request);
      await tx.done;

      // Si llega aquí, significa que la solicitud fue agregada correctamente
      return true;
    } catch (error) {
      console.error('Error adding request to queue:', error);
      // Si ocurre un error, retornamos false
      return false;
    }
  }

  // Obtener todas las solicitudes de la cola
  async getAllRequests() {
    const db = await openDB(this.dbName);
    return await db.transaction(this.requestStoreName, 'readonly').objectStore(this.requestStoreName).getAll();
  }

  // Obtener todas las solicitudes de la cola de peticiones realizadas
  async getAllTransactions() {
    const db = await openDB(this.dbName);
    return await db.transaction(this.transactionStoreName, 'readonly').objectStore(this.transactionStoreName).getAll();
  }

  // Eliminar una solicitudes de la cola
  async deleteRequest(id: number) {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.requestStoreName, 'readwrite');
    const store = tx.objectStore(this.requestStoreName);
    await store.delete(id);
    await tx.done;
  }

  //SERIALIZATION
  public async serializeRequestBody(body: FormData): Promise<any> {
    try {

      const data: any = {};

      for (const [key, value] of body.entries()) {
        if (value instanceof File) {
          await this.fileToBase64(value).then((base64) => {
            data[key] = base64;
          });
        } else {
          data[key] = value;
        }
      }

      return data

    } catch (error) {
      console.error('Error serializing request body:', error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    try {
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });
    } catch (error) {
      console.error('Error converting file to Base64:', error);
      throw error;
    }
  }

  /**
   * Deserializa los datos JSON a FormData.
   * Si los datos contienen Base64, los convierte de nuevo en Blob (en este caso imágenes).
   */
  private deserializeRequestBody(serializedData: any): FormData {
    const formData = new FormData();

    for (const key in serializedData) {
      const value = serializedData[key];

      if (_.isEqual(key, 'image_url')) {
        if (!_.isEmpty(value)) {
          const blob = this.dataURItoBlob(value);
          formData.append(key, blob);
        }
        formData.append(key, "");
      } else {
        formData.append(key, value);
      }
    }

    return formData;
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  /**
 * Procesa las solicitudes en cola una por una.
 */
  async processQueue(): Promise<void> {

    // Evitar ejecución concurrente
    if (this.isProcessingQueue) {
      console.log('Queue is already being processed. Skipping.');
      return;
    }

    this.isProcessingQueue = true;

    try {

      const queue = await this.getAllRequests(); // Obtiene todas las solicitudes almacenadas

      for (const item of queue) {
        const { _id, url, body, method, type } = item;

        const reqType = type === 'formdata' ? true : false;

        // Determinar el formato de los datos
        const data = reqType ? this.deserializeRequestBody(body) : body;

        const request = {
          url: url,
          method: method,
          body: data,
        };

        try {
          // Realizar la solicitud HTTP
          const response = await this.makeRequest(request, reqType).then(async () => {
            // Guardar éxito en IndexedDB
            await this.saveToQueue({
              url,
              method,
              status: 'success',
              error: null,
            }).then(async () => {
              // Eliminar la solicitud de la cola
              await this.deleteRequest(_id);
            });
          });
          console.log(`Request to ${request.url} succeeded:`, response);

        } catch (error: any) {
          console.error(`Request to ${request.url} failed:`, error);

          // Guardar error en IndexedDB
          await this.saveToQueue({
            url,
            method,
            status: 'failed',
            error: error.error.message || 'Unknown error',
          }).then(async () => {
            // Eliminar la solicitud de la cola
            await this.deleteRequest(_id);
          });
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      throw error;
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Método genérico para realizar peticiones HTTP.
   * @param request - Configuración de la petición (url, método, body).
   */
  private async makeRequest(request: { url: string; method: string; body: any }, requestType: boolean): Promise<any> {
    try {
      const options: any = { body: request.body };
      if (!requestType) {
        options.headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
      }

      // Realiza la solicitud HTTP
      const response = await firstValueFrom(this.http.request(request.method, request.url, options));
      return response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }

  /**
 * Guarda el resultado de una transacción en IndexedDB.
 * @param transaction - Información de la transacción a guardar.
 */
  async saveToQueue(transaction: { url: string; method: string; status: string; error: string | null }): Promise<void> {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreName, 'readwrite');
    await tx.objectStore(this.transactionStoreName).add(transaction);
    await tx.done;
  }

  /**
   * @description check if the request _id is already in the queue
   */

  async checkIfRequestIsInQueue(_id: number) {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreName, 'readonly');
    const store = tx.objectStore(this.transactionStoreName);
    const request = await store.get(_id);
    await tx.done;
    return request;
  }

  async deleteCompletedRequests() {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreName, 'readwrite');
    const store = tx.objectStore(this.transactionStoreName);
    await store.clear();
    await tx.done;
  }

  /***
   * CLIENT REQUESTS
   *
   */

  // Agregar una solicitud a la cola
  async addRequestToQueueSeller(request: any): Promise<boolean> {
    try {
      const db = await openDB(this.dbName);
      const tx = db.transaction(this.requestStoreSellerName, 'readwrite');
      const store = tx.objectStore(this.requestStoreSellerName);
      await store.add(request);
      await tx.done;

      // Si llega aquí, significa que la solicitud fue agregada correctamente
      return true;
    } catch (error) {
      console.error('Error adding request to queue:', error);
      // Si ocurre un error, retornamos false
      return false;
    }
  }

  // Obtener todas las solicitudes de la cola
  async getAllRequestsSeller() {
    const db = await openDB(this.dbName);
    return await db.transaction(this.requestStoreSellerName, 'readonly').objectStore(this.requestStoreSellerName).getAll();
  }

  // Eliminar una solicitudes de la cola
  async deleteRequestSeller(id: number) {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.requestStoreSellerName, 'readwrite');
    const store = tx.objectStore(this.requestStoreSellerName);
    await store.delete(id);
    await tx.done;
  }

  //Make request to seller only json
  async makeRequestSeller(request: { url: string; method: string; body: any }): Promise<any> {
    try {
      const options: any = { body: request.body };
      options.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });

      // Realiza la solicitud HTTP
      const response = await firstValueFrom(this.http.request(request.method, request.url, options));
      return response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }

  //Save request to queue seller
  async saveToQueueSeller(transaction: { url: string; method: string; status: string; error: string | null }): Promise<void> {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreSellerName, 'readwrite');
    await tx.objectStore(this.transactionStoreSellerName).add(transaction);
    await tx.done;
  }

  // Ejecutar la cola de solicitudes
  async processQueueSeller(): Promise<void> {

    // Evitar ejecución concurrente
    if (this.isProcessingQueue) {
      console.log('Queue is already being processed. Skipping.');
      return;
    }

    this.isProcessingQueue = true;

    try {

      const queue = await this.getAllRequestsSeller(); // Obtiene todas las solicitudes almacenadas

      for (const item of queue) {
        const { _id, url, body, method } = item;

        const request = {
          url: url,
          method: method,
          body: body,
        };

        try {

          // Realizar la solicitud HTTP
          const response = await this.makeRequestSeller(request).then(async () => {
            // Guardar éxito en IndexedDB
            await this.saveToQueueSeller({
              url,
              method,
              status: 'success',
              error: null,
            }).then(async () => {
              // Eliminar la solicitud de la cola
              await this.deleteRequestSeller(_id);
            });
          });
          console.log(`Request to ${request.url} succeeded:`, response);

        } catch (error: any) {
          console.error(`Request to ${request.url} failed:`, error);

          // Guardar error en IndexedDB
          await this.saveToQueueSeller({
            url,
            method,
            status: 'failed',
            error: error.error.message || 'Unknown error',
          }).then(async () => {
            // Eliminar la solicitud de la cola
            await this.deleteRequestSeller(_id);
          });
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      throw error;
    } finally {
      this.isProcessingQueue = false;
    }
  }

}
