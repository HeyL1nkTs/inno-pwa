import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SaleService } from '../../services/sale.service';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { ActivatedRoute, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MobileService } from '../../../generalServices/mobile.service';
import { MatSelectModule } from '@angular/material/select';
import { JwtService } from '../../../generalServices/jwt.service';
import { LoadingComponent } from '../../../generalServices/loading/loading.component';

interface ItemSelection {
  id: string;
  expander: boolean;
}

@Component({
  selector: 'app-sale-point',
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule, FormsModule,
    ReactiveFormsModule, MatInputModule, TooltipDirective,
    MatExpansionModule, MatCheckboxModule, CommonModule,
    MatSelectModule, LoadingComponent],
  templateUrl: './sale-point.component.html',
  styleUrl: './sale-point.component.css'
})
export class SalePointComponent {

  products: any[] = [];
  supplyExpander: ItemSelection[] = [];
  extrasExpander: ItemSelection[] = [];
  actualOrder: any;

  cart: any[] = [];
  cartPersonalization: any[] = [];
  filteredProducts: any[] = [];
  isDesktop = true;
  quantity: number = 0;
  cartType: string = '';

  controlMobile: boolean = false;
  mobileCapture: boolean = false;
  mobileButton: string = 'open_in_full';

  //POP
  paymentType: string = ''; // Selected payment type
  amountReceived: number = 0;
  change: number = 0; // Change to be returned
  showDetails: boolean = false; // Show payment details
  paymentProcess: boolean = false; // Payment process status

  wip: boolean = false;

  @HostListener('window:resize', [])
  onResize() {
    this.isDesktop = window.innerWidth > 768;
  }

  constructor(private sale: SaleService, private jwt: JwtService,
    private movileService: MobileService) { }

  ngOnInit() {
    this.isDesktop = window.innerWidth > 768;
    this.cartType = 'products';
    this.resetComponent();
    this.getData();
    this.movileService.isMobile.subscribe((isMobile) => {
      this.controlMobile = isMobile;
    });
  }

  changeSearch(type: string) {
    this.cartType = type;
    this.getData();
  }

  resetComponent() {
    this.cart = [];
    this.cartPersonalization = [];
    this.filteredProducts = [];
    this.quantity = 0;
    this.products = [];
    this.supplyExpander = [];
    this.extrasExpander = [];
    this.actualOrder = null;
    this.paymentType = '';
    this.amountReceived = 0;
    this.change = 0;
    this.showDetails = false;
    this.paymentProcess = false;
  }

  async getData() {
    this.wip = true;
    let data;
    if (this.cartType === 'products') {
      data = await this.sale.getProducts();
    } else {
      data = await this.sale.getCombos();
    }

    this.products = data;
    this.products.forEach(product => {
      product.quantity = 0;
    });
    this.filteredProducts = [...this.products];
    this.wip = false;
  }

  filterProducts(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }

  onDragStart(event: DragEvent, product: any) {
    event.dataTransfer?.setData('product', JSON.stringify(product));
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {

    event.preventDefault();
    const productData = event.dataTransfer?.getData('product');
    if (productData) {
      const product = JSON.parse(productData);
      this.generateEntry(product);
    }
  }

  onClick(product: any) {
    console.log(product);
  }

  generateEntry(product: any) {
    if (product.quantity === 0) {
      Swal.fire({
        title: 'Debes seleccionar al menos una unidad del producto',
        icon: 'error',
        confirmButtonText: 'Ok'
      })
    } else {
      this.consolidateOrder(product);
    }
  }

  consolidateOrder(item) {

    for (let i = 0; i < item.quantity; i++) {

      let copiedSupplies = [];
      if (item.supplies) {
        copiedSupplies = item.supplies.map(supply => ({
          ...supply,
          selected: true, // Asegurar que todos los supplies inician seleccionados
        }));
      }

      let copiedExtrasRelacionados = [];
      if (item.extrasRelacionados) {
        copiedExtrasRelacionados = item.extrasRelacionados.map(extra => ({
          ...extra,
          selected: false, // Asegurar que los extras inician no seleccionados
        }));
      }

      let copiedProducts = [];
      if (item.products) {
        copiedProducts = item.products.map(product => ({
          ...product,
          selected: true, // Asegurar que todos los supplies inician seleccionados
        }));
      }

      const isProduct = item.supplies && item.extrasRelacionados ? true : false;
      const isCombo = item.products ? true : false;

      const newProduct = {
        id: item.id,
        name: item.name,
        price: item.price,
        extrasRelacionados: copiedExtrasRelacionados,
        supplies: copiedSupplies,
        products: copiedProducts,
        isProduct: isProduct,
        isCombo: isCombo,
        temporalId: this.generateRandomId(),
      }

      this.addToCart(newProduct);

      Swal.fire({
        title: 'Producto agregado al carrito',
        icon: 'success',
        confirmButtonText: 'Ok'
      });
    }
  }

  generateProduct(product) {
    for (let i = 0; i < product.quantity; i++) {
      // Crear una copia profunda de supplies y extrasRelacionados
      const copiedSupplies = product.supplies.map(supply => ({
        ...supply,
        selected: true, // Asegurar que todos los supplies inician seleccionados
      }));

      const copiedExtrasRelacionados = product.extrasRelacionados.map(extra => ({
        ...extra,
        selected: false, // Asegurar que los extras inician no seleccionados
      }));

      const newProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        extrasRelacionados: copiedExtrasRelacionados,
        supplies: copiedSupplies,
        temporalId: this.generateRandomId(), // Generar un ID único
      };

      this.supplyExpander.push({ id: newProduct.temporalId, expander: false });

      this.addToCart(newProduct);
    }
  }

  generateCombo(combo) {
    for (let i = 0; i < combo.quantity; i++) {
      // Crear una copia profunda de supplies y extrasRelacionados
      const copiedProducts = combo.products.map(product => ({
        ...product,
        selected: true, // Asegurar que todos los supplies inician seleccionados
      }));

      const newCombo = {
        id: combo.id,
        name: combo.name,
        price: combo.price,
        products: copiedProducts,
        temporalId: this.generateRandomId(), // Generar un ID único
      };

      this.supplyExpander.push({ id: newCombo.temporalId, expander: false });

      this.addToCart(newCombo);
    }
  }

  generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  increaseQuantity(product: any) {
    product.quantity++;
  }

  decreaseQuantity(product: any) {
    if (product.quantity > 1) {
      product.quantity--;
    }
  }

  /**
   * CART SECTION
   */

  openSupplySlider(item) {
    item.expander = !item.expander;
  }

  openExtrasSlider(item) {
    item.expanderEx = !item.expanderEx;
  }

  openComboSlider(item) {
    item.expanderCo = !item.expanderCo;
  }

  // Función para calcular el precio total del carrito
  totalPrice(): number {
    let total = 0;

    // Recorrer todos los productos en el carrito
    this.cart.forEach(item => {
      total += item.price;
    });

    return total;
  }

  // Función para actualizar el precio cuando se seleccionan/deseleccionan supplies o extras
  updateItemPriceBySupply(itemId: string, supply: any) {
    this.cart.forEach(item => {
      if (item.temporalId === itemId) {
        item.supplies.forEach(itemSupply => {
          if (itemSupply._id === supply._id) {
            if (supply.selected) {
              item.price = item.price - (supply.price * supply.requiredQuantity);
            } else {
              item.price = item.price + (supply.price * supply.requiredQuantity);
            }
            itemSupply.selected = !itemSupply.selected;
          }
        });
      }
    });
  }

  updateItemPriceByExtra(itemId: string, extra: any) {
    this.cart.forEach(item => {
      if (item.temporalId === itemId) {
        item.extrasRelacionados.forEach(itemExtra => {
          if (itemExtra._id === extra._id) {
            if (extra.selected) {
              item.price = item.price - extra.price;
            } else {
              item.price = item.price + extra.price;
            }

            itemExtra.selected = !itemExtra.selected;
          }
        });
      }
    });
  }

  updateCombo(itemId, combo) {
    this.cart.forEach(item => {
      if (item.temporalId === itemId) {
        item.products.forEach(product => {
          if (product._id === combo._id) {
            product.selected = !product.selected;
          }
        });
      }
    });
  }


  // Ejemplo de agregar al carrito
  addToCart(product: any) {
    //const existingItem = this.cart.find(item => item.id === product.id);
    this.cart.push({ ...product });
  }

  // Función para eliminar un producto del carrito
  removeFromCart(itemId: any) {
    this.cart = this.cart.filter(cartItem => cartItem.temporalId !== itemId);
  }

  // Función para enviar la orden
  submitOrder() {
    console.log(this.cart);
    if (this.cart.length === 0) {
      Swal.fire({
        title: 'Debes tener por lo menos un producto en el carrito',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    } else {
      const order = [];
      for (let item of this.cart) {
        if (item.isProduct) {
          order.push(this.productOrder(item));
        } else {
          order.push(this.comboOrder(item));
        }
      }

      this.actualOrder = order;

      console.log(order);

      if (this.actualOrder) {
        this.paymentProcess = true;
      }
    }
  }

  productOrder(item) {
    const supplies = [];
    for (let supply of item.supplies) {
      if (supply.selected) {
        const supplySelected = {
          "id": supply._id,
          "name": supply.name,
          "price": supply.price
        }
        supplies.push(supplySelected);
      }
    }

    const extras = [];
    for (let extra of item.extrasRelacionados) {
      if (extra.selected) {
        const extraAdd = {
          "id": extra._id,
          "name": extra.name,
          "price": extra.price
        };
        extras.push(extraAdd);
      }
    }

    const sale = {
      "name": item.name,
      "price": item.price,
      "supplies": supplies,
      "extras": extras,
      "isProduct": true,
      "isCombo": false
    }

    return sale;
  }

  comboOrder(item) {
    const products = [];
    for (let product of item.products) {
      if (product.selected) {
        const productSelected = {
          "id": product._id,
          "name": product.name,
          "price": product.price
        }
        products.push(productSelected);
      }
    }

    const sale = {
      "name": item.name,
      "price": item.price,
      "products": products,
      "isCombo": true,
      "isProduct": false
    }

    return sale;
  }

  showCart() {
    this.mobileCapture = !this.mobileCapture;
    this.mobileButton = this.mobileCapture ? 'close' : 'open_in_full';
  }

  /**
   * @description Calculates the change and displays the payment summary.
   */
  calculateChange(): void {

    if (this.amountReceived === 0) {
      Swal.fire({
        title: 'No has ingresado la cantidad recibida',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    } else if (this.paymentType === '') {
      Swal.fire({
        title: 'Debes seleccionar un tipo de pago',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    } else {
      if (this.amountReceived < this.totalPrice()) {
        Swal.fire({
          title: 'La cantidad ingresada no es suficiente para cubrir el monto',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        return;
      }
      this.change = this.amountReceived - this.totalPrice();
      this.showDetails = !this.showDetails;
    }

  }

  getUser(){
    const tokenData = this.jwt.getPayloadWithtokenStorage();
    return {
      id: tokenData._id,
      name: tokenData.name
    }
  }

  async endOrder() {
    //process to back
    try {
      this.wip = true;
      const finalOrder = {
        orders: this.actualOrder,
        paymentInfo: {
          type: this.paymentType,
          amountReceived: this.amountReceived,
          change: this.change,
          total: this.totalPrice()
        },
        seller: {
          id: this.getUser().id,
          name: this.getUser().name
        }
      }
      const data = await this.sale.setOrder(finalOrder)

      if (data) {
        Swal.fire({
          title: 'Orden procesada con éxito',
          text: data.message ?? 'Consultar al administrador',
          icon: 'success',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.wip = false;
          this.resetComponent();
          this.getData();
        });
      }

    } catch (error) {
      Swal.fire({
        title: 'Error al procesar la orden',
        icon: 'error',
        text: error.error.message ?? 'Error desconocido',
        confirmButtonText: 'Ok'
      }).then(()=>{
        this.wip = false;
      });
    }
  }

  cancelPayment() {
    this.paymentProcess = !this.paymentProcess;
  }

}
