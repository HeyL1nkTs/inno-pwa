import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InternetService {

  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }

  /**
   * @description Returns the current online status as an observable.
   */
  get isOnline() {
    return this.onlineStatus$.asObservable();
  }

  /**
   * @description Updates the online status.
   * @param status The new online status.
   */
  private updateStatus(status: boolean) {
    this.onlineStatus$.next(status);
  }

  public isOnlineStatus(): boolean {
    return navigator.onLine;
  }
}
