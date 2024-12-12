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

  /**
   * @description Inicializa las bases de datos indexadas.
   * @param catalogs - Arreglo con los nombres de los catálogos a inicializar.
   */
  public async initializeDataBases(catalogs: string[]) {
    await openDB(this.dbName, 1, {
      upgrade(db) {
        for (const catalog of catalogs) {
          if (!db.objectStoreNames.contains(catalog)) {
            db.createObjectStore(catalog, { keyPath: '_id', autoIncrement: true });
          }
        }

        if (!db.objectStoreNames.contains('requestQueue')) {
          db.createObjectStore('requestQueue', { keyPath: '_id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('requestQueueSeller')) {
          db.createObjectStore('requestQueueSeller', { keyPath: '_id', autoIncrement: true });
        }
      }
    });
  }

  /**
   * @description Obtiene los elementos de un catálogo de la base de datos indexada.
   * @param catalog - Nombre del catálogo a consultar.
   */
  async getItems(catalog: string) {
    const db = await openDB(this.dbName, 1);
    const tx = db.transaction(catalog, 'readonly');
    const store = tx.objectStore(catalog);
    return store.getAll();
  }

  /**
   * @description Guarda la información en la base de datos indexada.
   * @param catalog - Nombre del catálogo donde se guardará la información.
   * @param data - Arreglo con los elementos a guardar.
   * @returns - Objeto con la información de la operación.
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
      return { success: true, message: 'Data saved successfully' };
    } catch (error) {
      console.error('Error saving information offline:', error);
      throw new Error('Failed to save data offline');
    }
  }

  /**
   * @description Guarda un solo elemento en la base de datos indexada.
   * @param catalog - Nombre del catálogo donde se guardará la información.
   * @param item - Elemento a guardar.
   * @returns - Objeto con la información de la operación.
   */
  async saveItem(catalog: string, item: any): Promise<any> {
    try {
      const db = await openDB(this.dbName, 1);
      const tx = db.transaction(catalog, 'readwrite');
      const store = tx.objectStore(catalog);
      if (!item._id) {
        item._id = Date.now().toString();
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

  /**
   * @description Limpia una tabla de la base de datos indexada.
   * @param catalog - Nombre del catálogo a limpiar.
   */
  async clearTable(catalog: string) {
    const db = await openDB(this.dbName, 1);
    const tx = db.transaction(catalog, 'readwrite');
    const store = tx.objectStore(catalog);
    await store.clear();
    await tx.done;
  }

  /**
   * @description Elimina todas las tablas de la base de datos indexada.
   * @param catalog - Nombre del catálogo a eliminar.
   */
  async clearTables(catalogs: string[]) {
    const db = await openDB(this.dbName, 1);
    for (const catalog of catalogs) {
      const tx = db.transaction(catalog, 'readwrite');
      const store = tx.objectStore(catalog);
      await store.clear();
      await tx.done;
    }
  }

  /**
   * @description Agrega una solicitud a la cola de peticiones.
   * @param request - Objeto con la información de la solicitud.
   * @returns - Booleano que indica si la solicitud fue agregada correctamente.
   */
  async addRequestToQueue(request: any): Promise<boolean> {
    try {
      const db = await openDB(this.dbName);
      const tx = db.transaction(this.requestStoreName, 'readwrite');
      const store = tx.objectStore(this.requestStoreName);
      await store.add(request);
      await tx.done;

      return true;
    } catch (error) {
      console.error('Error adding request to queue:', error);
      return false;
    }
  }

  /**
   * @description Obtiene todas las solicitudes de la cola de peticiones realizadas.
   * @returns - Arreglo con las solicitudes almacenadas.
   */
  async getAllRequests() {
    const db = await openDB(this.dbName);
    return await db.transaction(this.requestStoreName, 'readonly').objectStore(this.requestStoreName).getAll();
  }

  /**
   * @description Obtiene todas las transacciones almacenadas.
   * @returns - Arreglo con las transacciones almacenadas.
   */
  async getAllTransactions() {
    const db = await openDB(this.dbName);
    return await db.transaction(this.transactionStoreName, 'readonly').objectStore(this.transactionStoreName).getAll();
  }

  /**
   * @description Elimina una solicitud de la cola de peticiones.
   * @param id - ID de la solicitud a eliminar.
   */
  async deleteRequest(id: number) {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.requestStoreName, 'readwrite');
    const store = tx.objectStore(this.requestStoreName);
    await store.delete(id);
    await tx.done;
  }

  /**
   * @description Serializa los datos de un FormData a JSON.
   * @param body - Datos del FormData a serializar.
   * @returns - Objeto JSON con los datos serializados.
   */
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

  /**
   * @description Convierte un archivo a Base64.
   * @param file - Archivo a convertir.
   * @returns - Cadena Base64 del archivo.
   */
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
   * @description Deserializa los datos JSON a FormData.
   * Si los datos contienen Base64, los convierte de nuevo en Blob (en este caso imágenes).
   * @param serializedData - Datos serializados a deserializar.
   * @returns - Objeto FormData con los datos deserializados.
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

  /**
   * @description Convierte una cadena Base64 a Blob.
   * @param dataURI - Cadena Base64 a convertir.
   * @returns - Objeto Blob con los datos convertidos.
   */
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
   * @description Ejecutar la cola de solicitudes una por una.
   * Si una solicitud falla, se guarda en IndexedDB y se elimina de la cola.
   * Si una solicitud tiene éxito, se elimina de la cola.
   * Si una solicitud está en proceso, se salta y se procesa la siguiente.
   * Si la cola está vacía, se detiene el proceso.
   * @returns - Promesa que se resuelve cuando se procesan todas las solicitudes de la cola.
   */
  async processQueue(): Promise<void> {

    // Evitar ejecución concurrente
    if (this.isProcessingQueue) {
      console.log('Queue is already being processed. Skipping.');
      return;
    }

    this.isProcessingQueue = true;

    try {

      const queue = await this.getAllRequests();

      for (const item of queue) {
        const { _id, url, body, method, type } = item;

        const reqType = type === 'formdata' ? true : false;

        const data = reqType ? this.deserializeRequestBody(body) : body;

        const request = {
          url: url,
          method: method,
          body: data,
        };

        try {
          const response = await this.makeRequest(request, reqType).then(async () => {
            await this.saveToQueue({
              url,
              method,
              status: 'success',
              error: null,
            }).then(async () => {
              await this.deleteRequest(_id);
            });
          });
          console.log(`Request to ${request.url} succeeded:`, response);

        } catch (error: any) {
          console.error(`Request to ${request.url} failed:`, error);

          await this.saveToQueue({
            url,
            method,
            status: 'failed',
            error: error.error.message || 'Unknown error',
          }).then(async () => {
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
   * @description Método genérico para realizar peticiones HTTP.
   * @param request - Configuración de la petición (url, método, body).
   * @param requestType - Tipo de solicitud (formdata o json).
   * @returns - Promesa con la respuesta de la petición.
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
 * @returns - Promesa que se resuelve cuando se guarda la transacción.
 */
  async saveToQueue(transaction: { url: string; method: string; status: string; error: string | null }): Promise<void> {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreName, 'readwrite');
    await tx.objectStore(this.transactionStoreName).add(transaction);
    await tx.done;
  }

  /**
   * @description Check if the request _id is already in the queue
   * @param _id - ID of the request to check
   * @returns - Promise that resolves to the request if it is in the queue, or undefined if it is not.
   */
  async checkIfRequestIsInQueue(_id: number) {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreName, 'readonly');
    const store = tx.objectStore(this.transactionStoreName);
    const request = await store.get(_id);
    await tx.done;
    return request;
  }

  /**
   * @description Delete all completed requests from the queue
   * @returns - Promise that resolves when all completed requests are deleted.
   */
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

  /**
   * @description Agrega una solicitud a la cola de peticiones del cliente.
   * @param request - Objeto con la información de la solicitud.
   * @returns - Booleano que indica si la solicitud fue agregada correctamente.
   */
  async addRequestToQueueSeller(request: any): Promise<boolean> {
    try {
      const db = await openDB(this.dbName);
      const tx = db.transaction(this.requestStoreSellerName, 'readwrite');
      const store = tx.objectStore(this.requestStoreSellerName);
      await store.add(request);
      await tx.done;

      return true;
    } catch (error) {
      console.error('Error adding request to queue:', error);
      return false;
    }
  }

  /**
   * @description Obtiene todas las solicitudes de la cola de peticiones del vendedor.
   * @returns - Arreglo con las solicitudes almacenadas.
   */
  async getAllRequestsSeller() {
    const db = await openDB(this.dbName);
    return await db.transaction(this.requestStoreSellerName, 'readonly').objectStore(this.requestStoreSellerName).getAll();
  }

  /**
   * @description Elimina una solicitud de la cola de peticiones del vendedor.
   * @param id - ID de la solicitud a eliminar.
   */
  async deleteRequestSeller(id: number) {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.requestStoreSellerName, 'readwrite');
    const store = tx.objectStore(this.requestStoreSellerName);
    await store.delete(id);
    await tx.done;
  }

  /**
   * @description Método genérico para realizar peticiones HTTP.
   * @param request - Configuración de la petición (url, método, body).
   * @returns - Promesa con la respuesta de la petición.
   */
  async makeRequestSeller(request: { url: string; method: string; body: any }): Promise<any> {
    try {
      const options: any = { body: request.body };
      options.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });

      const response = await firstValueFrom(this.http.request(request.method, request.url, options));
      return response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }

  /**
   * @description Guarda el resultado de una transacción en IndexedDB.
   * @param transaction - Información de la transacción a guardar.
   * @returns - Promesa que se resuelve cuando se guarda la transacción.
   */
  async saveToQueueSeller(transaction: { url: string; method: string; status: string; error: string | null }): Promise<void> {
    const db = await openDB(this.dbName);
    const tx = db.transaction(this.transactionStoreSellerName, 'readwrite');
    await tx.objectStore(this.transactionStoreSellerName).add(transaction);
    await tx.done;
  }

  /**
   * @description Processa la cola de solicitudes del vendedor
   * Si una solicitud falla, se guarda en IndexedDB y se elimina de la cola.
   * Si una solicitud tiene éxito, se elimina de la cola.
   * Si una solicitud está en proceso, se salta y se procesa la siguiente.
   * Si la cola está vacía, se detiene el proceso.
   * @returns - Promesa que se resuelve cuando se procesan todas las solicitudes de la cola.
   */
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
          const response = await this.makeRequestSeller(request).then(async () => {

            await this.saveToQueueSeller({
              url,
              method,
              status: 'success',
              error: null,
            }).then(async () => {
              await this.deleteRequestSeller(_id);
            });
          });
          console.log(`Request to ${request.url} succeeded:`, response);

        } catch (error: any) {
          console.error(`Request to ${request.url} failed:`, error);

          await this.saveToQueueSeller({
            url,
            method,
            status: 'failed',
            error: error.error.message || 'Unknown error',
          }).then(async () => {
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
