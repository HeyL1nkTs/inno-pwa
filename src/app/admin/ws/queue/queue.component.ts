import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';
import { IndexDbService } from '../../../pwa/index.db.service';
import { InternetService } from '../../services/internet.service';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [MatTable, MatTableModule, MatIconModule, MatButtonModule, MatIcon, MatButton, CommonModule],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.css'
})
export class QueueComponent {
  displayedColumns: string[] = ['id', 'method', 'body'];
  displayedColumnsOnline: string[] = ['id', 'method', 'status']; // Online Table
  dataSource: any[] = [];
  dataSourceOnline: any[] = []; // Data for online table
  isAppOnline:boolean = false;

  constructor(private idb: IndexDbService, private internetService: InternetService) { }

  ngOnInit(): void {
    this.internetService.isOnline.subscribe((isOnline) => {
      this.isAppOnline = isOnline;
      if (isOnline) {
        this.getOnline();
      } else {
        this.getOffline();
      }
    });
  }

  getOffline() {
    this.getRequestsFromQueue().then((requests) => {
      // Transformar los datos para la tabla
      this.dataSource = requests.map((request) => ({
        catalog: this.extractCatalog(request.url),
        method: this.mapMethod(request.method),
        body: request.body,
      }));
    });
  }

  getOnline() {
    // Get online requests
    this.getOnlineRequests().then((requests) => {
      // Transformar los datos para la tabla
      this.dataSourceOnline = requests.map((request) => ({
        catalog: this.extractCatalog(request.url),
        method: this.mapMethod(request.method),
        status: request.status,
      }));
    });
  }

  /**
   * Extracts the catalog name from the URL.
   * @param url The URL to process.
   * @returns Catalog name.
   */
  private extractCatalog(url: string): string {
    return url.split('/').pop() || 'Unknown';
  }

  /**
   * Maps HTTP methods to user-friendly action names.
   * @param method The HTTP method.
   * @returns Action name.
   */
  private mapMethod(method: string): string {
    switch (method) {
      case 'POST':
        return 'Add';
      case 'PUT':
        return 'Edit';
      case 'DELETE':
        return 'Delete';
      default:
        return 'Unknown';
    }
  }

  async getRequestsFromQueue(): Promise<any> {
    const data = await this.idb.getAllRequests();
    return data;
  }

  async getOnlineRequests(): Promise<any> {
    const data = await this.idb.getAllTransactions();
    return data;
  }
}
