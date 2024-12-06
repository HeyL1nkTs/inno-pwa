import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndexDbService } from '../../pwa/index.db.service';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url: string = `${environment.url}`;
  private module: string = 'auth';

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  constructor(private http: HttpClient, private idb: IndexDbService) { }

  updateProfile(id: string, data: string): Observable<any>{
      return this.http.put<any>(this.url + this.module + '/user/main/'+ id, data, {headers: this.headers})
  }
}
