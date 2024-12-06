import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { PopComponent } from '../pop/pop.component';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Avatar, Product, Supply } from '../../../models/elements.model';
import { CatalogService } from '../../services/catalog.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { scaleAnimation } from '../../../animations/animate';
import { LoadingComponent } from '../loading/loading.component';
import { InternetService } from '../../services/internet.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { IndexDbService } from '../../../pwa/index.db.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [MatIcon, TooltipDirective,
    PopComponent, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    ReactiveFormsModule, FormsModule,
    MatCheckbox, LoadingComponent, CommonModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  animations: [scaleAnimation]
})
export class CatalogComponent implements OnInit, OnChanges {

  @Input() search: string = '';
  @Input() module: string = '';
  @Input() items: any[] = [];
  @Input() title: string = '';

  @Output() updateItemList: EventEmitter<boolean> = new EventEmitter<boolean>();

  setVisible: string = 'void';
  pop: boolean = false;
  itemData: any[] = [];
  state: string = 'void';
  addSupplyState: string = 'void';

  filteredItems: any[] = []; // Array para almacenar los elementos filtrados
  originalItems: any[] = []; // Array para almacenar los elementos originales

  add: boolean = false; //false
  form: FormGroup;
  action: string = 'add';
  isNotSupply: boolean = false;
  actualStock: number = 0; //show the actual item stock
  stock: number = 0; //show the stock to be changed
  showStock: boolean = false;
  selectedImage: File | null = null; // Variable para almacenar la imagen seleccionada
  selectedImageName: string = ''; // Variable para almacenar el nombre de la imagen seleccionada
  editedImage: string = ''; // Variable para almacenar la imagen editada
  showAddSupplyModal: boolean = false; //false
  selectedSupply: any[] = [];

  item: Avatar;
  suppliesList: Supply[] = [];
  productsList: Product[] = [];
  showAddProductModal: boolean = false;
  addProductState: string = 'void';
  selectedProduct: any[] = [];
  wip: boolean = false;

  enableActions$: Observable<boolean>;

  constructor(private fb: FormBuilder,
    private catalogService: CatalogService,
    private internetService: InternetService,
    private idb: IndexDbService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0],
      image_url: [''],
      haveStock: [, Validators.required],
      discount: [''],
      supplies: this.fb.array([]),
      products: this.fb.array([]),
      //stock on add start with 0 and edit with the current stock
      //if is a product haveStock start with 1 and is disabled
    });
    this.enableActions$ = this.internetService.isOnline;
  }

  async ngOnInit() {
    this.wip = true;
    const titleLower = this.title.toLowerCase();

    this.isNotSupply = titleLower !== 'supplies';
    if (this.isNotSupply) {
      const haveStockControl = this.form.get('haveStock');
      haveStockControl?.disable();
      haveStockControl?.setValue(true);
    }

    try {
      if (titleLower === 'products') {
        this.suppliesList = await this.catalogService.getItems('supplies', '');
      } else if (titleLower === 'combos') {
        this.productsList = await this.catalogService.getItems('products', '');
      }
    } catch (error) {
      console.error('Error loading catalog data:', error);
    } finally {
      this.wip = false;
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    this.wip = true;
    // Verifica si hay cambios en `items`
    if (changes['items']) {
      this.originalItems = [...this.items]; // Almacena una copia del arreglo original
      this.filterItems(); // Llama al método para filtrar los elementos
      this.wip = false;
    }
    // Verifica si hay cambios en `search` y filtra nuevamente
    if (changes['search']) {
      this.filterItems();
      this.wip = false;
    }
  }

  onHaveStockChange(event: MatSelectChange) {
    const optionSelected = event.value;
    this.isNotSupply = optionSelected;
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedImage = fileInput.files[0];
      this.selectedImageName = this.selectedImage.name;
    }
  }

  filterItems() {
    // Si el campo de búsqueda está vacío, devuelve el arreglo original
    if (!this.search) {
      this.filteredItems = [...this.originalItems];
    } else {
      // Filtra los elementos basados en la búsqueda
      this.filteredItems = this.originalItems.filter(item =>
        item.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }

  // Método para acceder al FormArray
  get supplies() {
    return this.form.get('supplies') as FormArray;
  }

  get products() {
    return this.form.get('products') as FormArray;
  }

  // Método para agregar un suministro al array
  addSupply(supply: any) {
    if (!this.isSupplySelected(supply)) {
      supply.required = supply.required ? supply.required : 1;

      const supplyForm = this.fb.group({
        _id: [supply._id],
        name: [supply.name],
        required: [supply.required],
      });
      this.supplies.push(supplyForm);
      this.selectedSupply.push(supply);
    }
  }

  // Añade un producto al FormArray de Combo Products
  addComboProduct(product: any) {

    if (!this.isProductSelected(product)) {

      product.discount = product.discount ? product.discount : 0;

      const productForm = this.fb.group({
        _id: [product._id],
        name: [product.name],
        discount: [product.discount, [Validators.required, Validators.min(0), Validators.max(100)]],
      });
      this.products.push(productForm);
      this.selectedProduct.push(product);
    }

  }

  // Método para abrir el modal
  openAddSupplyModal() {
    this.showAddSupplyModal = true;
    this.addSupplyState = 'visible';
  }

  // Método para cerrar el modal
  closeAddSupplyModal() {
    setTimeout(() => {
      this.showAddSupplyModal = false;
    }, 300);
    this.addSupplyState = 'void';
  }

  // Método para abrir el modal
  openAddProductModal() {
    this.showAddProductModal = true;
    this.addProductState = 'visible';
  }

  // Método para cerrar el modal
  closeAddProductModal() {
    setTimeout(() => {
      this.showAddProductModal = false;
    }, 300);
    this.addProductState = 'void';
  }

  // Método para manejar la selección de suministros dentro del modal
  onSupplySelected(supply: any, event: any) {
    if (event.checked) {
      this.addSupply(supply);  // Agregar el suministro si está seleccionado
    } else {
      this.removeSupply(supply);  // Eliminarlo si se deselecciona
    }
  }

  // Método para manejar la selección de productos dentro del modal
  onProductSelected(product: any, event: any) {
    if (event.checked) {
      this.addComboProduct(product);  // Agregar el producto si está seleccionado
    } else {
      this.removeComboProduct(product);  // Eliminarlo si se deselecciona
    }
  }

  // Método para eliminar un suministro del FormArray
  removeSupply(supply: any) {
    // Eliminar del FormArray
    const index = this.supplies.controls.findIndex((control: any) => control.value._id === supply._id);
    if (index !== -1) {
      this.supplies.removeAt(index);
    }
    // Eliminar de `selectedSupplies`
    this.selectedSupply = this.selectedSupply.filter((selectedSupply: any) => selectedSupply._id !== supply._id);
  }

  // Remueve un producto del FormArray de Combo Products
  removeComboProduct(product: any) {
    const index = this.products.controls.findIndex((control: any) => control.value._id === product._id);
    if (index !== -1) {
      this.products.removeAt(index);
    }

    this.selectedProduct = this.selectedProduct.filter((selectedProduct: any) => selectedProduct._id !== product._id);
  }

  showReceipt(data: any[]) {
    this.setVisible = 'visible';
    this.pop = true;
    this.itemData = data;
  }

  closeReceipt(event: string) {
    setTimeout(() => {
      this.pop = false;
    }, 300);
    this.setVisible = event;
  }

  addItem() {
    this.add = true;
    this.action = 'add';
  }

  editItem(item: any) {
    this.wip = true;
    this.action = 'edit';
    this.add = true;
    this.item = item;

    this.form.get('name')?.setValue(item.name);
    this.form.get('price')?.setValue(item.price);
    this.editedImage = item.image_url;
    this.isNotSupply = item.haveStock;
    this.actualStock = item.stock;
    this.selectedImage = null;
    this.form.get('haveStock')?.setValue(item.haveStock);
    if (this.title.toLowerCase() === 'products') {
      for (const supply of item.supplies) {
        this.addSupply(supply);
      }
    }
    if (this.title.toLowerCase() === 'combos') {
      for (const product of item.products) {
        this.addComboProduct(product);
      }
    }
    this.wip = false;
  }

  isSupplySelected(supply: any): boolean {
    return this.selectedSupply.some((selectedSupply: any) => selectedSupply._id === supply._id);
  }

  isProductSelected(product: any): boolean {
    return this.selectedProduct.some((selectedProduct: any) => selectedProduct._id === product._id);
  }

  closeItem() {
    if (!this.wip) {
      this.wip = true;
    }
    this.add = false;
    this.isNotSupply = this.title.toLowerCase() === 'supplies' ? false : true;
    this.editedImage = '';
    this.item = null;
    this.selectedImage = null;
    this.selectedImageName = '';
    if (this.title.toLowerCase() === 'products') {
      const suppliesArray = this.form.get('supplies') as FormArray;
      while (suppliesArray.length > 0) {
        suppliesArray.removeAt(0);
      }
    }
    if (this.title.toLowerCase() === 'combos') {
      const productsArray = this.form.get('products') as FormArray;
      while (productsArray.length > 0) {
        productsArray.removeAt(0);
      }
    }
    this.selectedProduct = [];
    this.selectedSupply = [];
    this.form.reset();
    this.wip = false;
  }

  findStock(item: any) {
    this.item = item;
    this.actualStock = this.item?.stock;
    this.showStock = true;
    this.state = 'visible';
  }

  closeStockChange() {
    setTimeout(() => {
      this.showStock = false;
      this.wip = false;
    }, 300);
    this.item = null;
    this.actualStock = 0;
    this.stock = 0;
    this.state = 'void';
    this.selectedImage = null;
    this.selectedImageName = '';
    this.updateItemList.emit(true);
  }

  increaseStock() {
    this.stock = this.stock + 1;
  }

  decreaseStock() {
    if (this.stock <= -this.actualStock) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `The stock cannot be less than 0`,
        footer: 'Please try again later'
      });
    } else {
      this.stock = this.stock - 1;
    }
  }

  validateStock(): void {
    if (this.stock < -this.actualStock) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `The stock cannot be less than ${-this.actualStock}`,
        footer: 'Please try again later'
      });
      this.stock = -this.actualStock; // Reajustar al valor mínimo permitido
    } else if (this.stock === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'The stock cannot be 0',
        footer: 'Please try again later'
      });
      this.stock = 1; // O establece un valor por defecto (por ejemplo, 1)
    }
  }

  /**
   * @description Add stock to the item selected
   */
  async addStock() {
    try {
      this.wip = true;
      const itemstockModified = this.item;
      console.log(this.internetService.isOnlineStatus());
      if (!this.internetService.isOnlineStatus()) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'You are offline, this action is not available',
          footer: 'Please try again later'
        }).then(() => {
          this.wip = false;
        });
      } else {
        switch (this.title.toLowerCase()) {
          case 'supplies':
            if (this.stock >= 0) {
              itemstockModified.stock = this.stock + this.actualStock;
            } else {
              itemstockModified.stock = this.actualStock + this.stock;
            }
            break;
          case 'products':
            itemstockModified.stock = this.stock;
            break;
          case 'combos':
            itemstockModified.stock = this.stock;
            break;
        }

        itemstockModified.image_url = '';
        if (this.stock === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `The stock cannot be 0`,
            footer: 'Please try again later'
          }).then(() => {
            this.wip = false;
          });
        } else {
          const data = await this.catalogService.updateStock(this.title.toLowerCase(), JSON.stringify(itemstockModified), 'stock', itemstockModified._id.toString());
          console.log(data);
          if (data) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: data.message ?? 'The item has been added',
              timer: 3000,
              timerProgressBar: true,
              footer: 'The item has been added'
            }).then(() => {
              this.closeStockChange();
            });
          }
        }
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      this.wip = false;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.error.message ?? 'The item could not be added ',
        footer: 'An error occurred'
      });
    }

  }

  consolidateFormData() {
    const formData = new FormData();
    formData.append('name', this.form.get('name')?.value);
    formData.append('price', this.form.get('price')?.value ?? '0');
    console.log(this.selectedImage)
    if (this.selectedImage) {
      formData.append('image_url', this.selectedImage, this.selectedImageName);
    } else {
      formData.append('image_url', '');
    }
    formData.append('haveStock', this.isNotSupply ? true : this.form.get('haveStock')?.value);
    formData.append('stock', this.actualStock.toString());
    if (this.title.toLowerCase() === 'products') {
      formData.append('supplies', JSON.stringify(this.form.get('supplies')?.value));
    } else if (this.title.toLowerCase() === 'combos') {
      formData.append('products', JSON.stringify(this.form.get('products')?.value));
    }

    return formData;
  }

  async process() {
    this.wip = true;
    try {
      if (this.form.valid) {
        const formData = this.consolidateFormData();
        switch (this.action) {
          case 'add':
            const addData = await this.catalogService.setItems(this.title.toLowerCase(), formData);
            console.log(addData);
            if (addData) {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: addData.message ?? 'The item has been added',
                timer: 3000,
                timerProgressBar: true,
                footer: 'The item has been added'
              }).then(() => {
                this.wip = false;
                this.updateItemList.emit(true);
                this.closeItem();
              });
            }
            break;

          case 'edit':
            if (!this.form.get('haveStock')?.value) {
              this.form.get('price')?.setValue(0);
            }
            const editData = await this.catalogService.updateItem(this.title.toLowerCase(), formData, this.item._id.toString());
            if (editData) {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: editData.message ?? 'The item has been updated',
                timer: 3000,
                timerProgressBar: true,
                footer: 'The item has been updated'
              }).then(() => {
                this.wip = false;
                this.updateItemList.emit(true);
                this.closeItem();
              });
            }
            break;
          default:
            break;
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please fill the required fields',
          footer: 'Please try again'
        }).then(() => {
          this.wip = false;
        });
      }
    } catch (error) {
      console.error('Error with action:', error);
      this.wip = false;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.error.message ?? 'The item could not be added or modified',
        footer: 'An error occurred'
      });
    }
  }

  deleteItem(id: number) {
    try {
      this.wip = true;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this item!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.catalogService.deleteItem(this.title.toLowerCase(), id);
          if (data) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: data.message ?? 'The item has been deleted',
              timer: 3000,
              timerProgressBar: true,
              footer: 'The item has been deleted'
            }).then(() => {
              this.updateItemList.emit(true);
              this.wip = false;
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            'Cancelled',
            'The item is safe :)',
            'error'
          ).then(() => {
            this.wip = false;
          });
        }
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.error.message ?? 'The item could not be deleted',
        footer: 'An error occurred'
      });
    }
  }

  clearRequests(){
    this.idb.deleteCompletedRequests()
  }

}
