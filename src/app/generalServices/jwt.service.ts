import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  /**
  * @description Decodes a JWT and returns its payload.
  * @param token The JWT string to decode.
  * @returns The decoded payload as an object or null if the token is invalid.
  */
  getPayload(token: string): any | null {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid JWT token:', error);
      return null;
    }
  }

  /**
   * @description Checks if a JWT is expired based on its payload.
   * @param token The JWT string to check.
   * @returns True if the token is expired, false otherwise.
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload: any = this.getPayload(token);
      if (!payload || !payload.exp) {
        return true; // Expired if no expiration claim exists
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired on error
    }
  }

  /**
   * @description Gets the payload of the token stored in the local storage.
   * @returns The payload of the token stored in the local storage.
   */
  getPayloadWithtokenStorage(): any{
    const token = localStorage.getItem('token');
    return this.getPayload(token);
  }

  checkRoleInToken() {
    const token = localStorage.getItem('token');
    const payload = this.getPayload(token);
    const role = payload.role;
    return role;
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if(token){
      return true;
    }else{
      return false;
    }
  }
}
