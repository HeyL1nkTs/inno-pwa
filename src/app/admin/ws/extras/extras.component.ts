import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CatalogService } from '../../services/catalog.service';
import Swal from 'sweetalert2';
import { PopComponent } from '../../html/pop/pop.component';

@Component({
  selector: 'app-extras',
  standalone: true,
  imports: [CommonModule, MatDialogModule,
    MatListModule, MatChipsModule,
    MatIconModule, MatLabel, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatFormFieldModule,
    MatButtonModule, ReactiveFormsModule, FormsModule, TooltipDirective, PopComponent],
  templateUrl: './extras.component.html',
  styleUrl: './extras.component.css'
})
export class ExtrasComponent {
  extras: any[] = [];

  allProducts: any[] = [];
  selectedProducts: any[] = [];
  dialogSelectedProducts: any[] = [];

  showForm = false;
  extraForm: FormGroup;

  formLabel: string = 'add'
  pop: boolean = false;
  setVisible: string = 'hidden';
  itemData: any;

  editStatus: boolean = false;

  @ViewChild('productDialog') productDialog!: TemplateRef<any>;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private catalogService: CatalogService) {
    this.extraForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.getExtras();
    this.getProducts();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.formLabel = this.showForm ? 'close' : 'add';
    if (!this.showForm) {
      this.editStatus = false;
      this.extraForm.reset();
      this.selectedProducts = [];
      this.dialogSelectedProducts = [];
    }
  }

  editExtra(extra: any): void {
    this.extraForm.patchValue(extra);
    this.selectedProducts = extra.products;
    this.editStatus = true;
    this.showForm = true;
  }

  openProductDialog(): void {
    this.dialog.open(this.productDialog);
    if (this.selectedProducts.length > 0) {
      this.dialogSelectedProducts = [...this.selectedProducts];
    }
  }

  closeProductDialog(): void {
    this.selectedProducts = [...this.selectedProducts, ...this.dialogSelectedProducts];
    this.dialog.closeAll();
  }

  removeProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
  }

  addProducts(): void {
    this.selectedProducts = [...new Set([...this.selectedProducts, ...this.dialogSelectedProducts])]; // Evita duplicados
  }

  resetSelected(): void {
    this.dialogSelectedProducts = [];
  }

  showProducts(products: any): void {
    this.itemData = products;
    this.pop = !this.pop;
    this.setVisible = this.pop ? 'visible' : 'hidden';
  }

  closeReceipt(event: string) {
    setTimeout(() => {
      this.pop = false;
    }, 300);
    this.setVisible = event;
  }

  /**
   * ACTIONS
   */

  async getExtras() {
    this.extras = await this.catalogService.getItems('extras', '');
  }

  async getProducts() {
    try {
      const products = await this.catalogService.getItems('products', '');
      for (let product of products) {
        product.image_url = '';
      }
      this.allProducts = products;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async submitForm() {

    try {

      if (this.editStatus) {

        const newExtra = {
          ...this.extraForm.value,
          products: JSON.stringify(this.selectedProducts),
        };

        const result = await this.catalogService.updateItem('extras', newExtra, newExtra._id);

        if (result) {
          Swal.fire({
            title: 'Extra updated',
            text: 'The extra was updated successfully',
            icon: 'success',
            confirmButtonText: 'Ok'
          }).then(() => {
            this.getExtras();
            this.toggleForm();
          });
        }
      } else {

        const { _id = '', ...newExtra } = {
          ...this.extraForm.value,
          products: JSON.stringify(this.selectedProducts),
        };

        const result = await this.catalogService.setItems('extras', newExtra);

        if (result) {
          Swal.fire({
            title: 'Extra created',
            text: 'The extra was created successfully',
            icon: 'success',
            confirmButtonText: 'Ok'
          }).then(() => {
            this.getExtras();
            this.toggleForm();
          });
        }
      }

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.error.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }

  deleteExtra(id: number): void {
    try {

      if (!id) {
        throw new Error('Invalid ID');
      }

      Swal.fire({
        title: 'Delete extra',
        text: 'Are you sure you want to delete this extra?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          const result = this.catalogService.deleteItem('extras', id);
          console.log(result);
          if (result) {
            Swal.fire({
              title: 'Extra deleted',
              text: 'The extra was deleted successfully',
              icon: 'success',
              confirmButtonText: 'Ok'
            }).then(() => {
              this.getExtras();
            });
          }
        }
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.error.message ?? 'An error occurred',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }
}
