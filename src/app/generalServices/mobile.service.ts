import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  isMobileScreen: boolean = false; //mobile width <= 767px
  private mobileStatus$ = new BehaviorSubject<boolean>(this.isMobileScreen);

  constructor() {
    this.checkScreenSize();
    this.updateMobileStatus();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.checkScreenSize();
    this.updateMobileStatus();
  }

  /**
   * @description Variable que indica si la pantalla es móvil o no
   * @param {void}
   * @type {boolean}
   */
  checkScreenSize() {
    this.isMobileScreen = window.innerWidth <= 767;
    return this.isMobileScreen;
  }

  /**
   * @description Actualiza el BehaviorSubject con el estado actual de la pantalla.
   */
  private updateMobileStatus() {
    this.mobileStatus$.next(this.isMobileScreen);
  }

  /**
   * @description Devuelve un Observable para escuchar los cambios de tamaño de pantalla.
   * @returns {Observable<boolean>} Observable con el estado móvil.
   */
  get isMobile(): Observable<boolean> {
    return this.mobileStatus$.asObservable();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}

