import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { firstValueFrom } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url: string = `${environment.url}`;
  private module: string = 'auth';
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  private readonly tokenKey = 'token';

  constructor(private http: HttpClient) { }

  /**
   * @description Login service
   * @param form json with email and password
   * @returns token
   */
  login(form: string): any {
    return this.http.post(this.url + this.module + '/login', form, { headers: this.headers });
  }

  /**
   * @description Saves the token to localStorage.
   * @param {string} token - The JWT to save.
   */
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * @description Retrieves the token from localStorage.
   * @returns {string | null} - The JWT or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * @description Removes the token from localStorage.
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  logout(user: User) {
    return firstValueFrom(this.http.post(this.url + this.module + '/logout', JSON.stringify(user), { headers: this.headers }));
  }
}
