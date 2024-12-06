import { Component, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CatalogComponent } from '../../html/catalog/catalog.component';
import { Combo, Product, Supply } from '../../../models/elements.model';
import { ActivatedRoute, Params } from '@angular/router';
import _, { get, set } from 'lodash';
import { fadeComponent } from '../../../animations/animate';
import { CatalogService } from '../../services/catalog.service';
import { LoadingComponent } from '../../html/loading/loading.component';
import Swal from 'sweetalert2';
import { InternetService } from '../../services/internet.service';
import { IndexDbService } from '../../../pwa/index.db.service';

@Component({
  selector: 'app-catalog-selector',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatIcon, CatalogComponent, LoadingComponent],
  templateUrl: './catalog-selector.component.html',
  styleUrl: './catalog-selector.component.css',
  animations: [fadeComponent]
})
export class CatalogSelectorComponent implements OnInit {

  searchText: string = '';
  fadeState: boolean = true;

  selection: string = '';
  data: any[] = [];
  title: string = '';

  wip: boolean = false;

  constructor(private route: ActivatedRoute,
    private catalogService: CatalogService,
    private internetService: InternetService,
    private indexDbService: IndexDbService) { }

  ngOnInit() {
    this.wip = true;
    this.route.params.subscribe((params: Params) => {
      this.selection = params['selector'];
      this.title = _.capitalize(this.selection);

      this.getItems();
      this.returnIfInternetReturns();

      // Ejecuta el cambio de datos con la animación
      this.fadeState = false;
      setTimeout(() => {
        this.fadeState = true;
      }, 0);
    });
  }

  public returnIfInternetReturns() {
    this.internetService.isOnline.subscribe(async (status) => {
      if (status) {
        await this.indexDbService.processQueue().then(()=>{
          this.getItems();
        });
      }
    });
  }

  async getItems() {
    try {
      this.wip = true;
      const items = await this.catalogService.getItems(this.selection, '');
      if (items.length > 0) {
        this.data = items;
      } else {
        this.data = [];
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'Error al obtener los datos',
        icon: 'error',
      }).then(() => {
        this.wip = false;
      });
    } finally {
      this.wip = false;
    }
  }

  updateItemList(event: boolean) {
    this.getItems();
  }

}
