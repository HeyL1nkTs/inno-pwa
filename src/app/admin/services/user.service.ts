import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndexDbService } from '../../pwa/index.db.service';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { User } from '../../models/user.model';

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

  getUsers(id: number) {
    return firstValueFrom(this.http.get<User[]>(this.url + this.module + '/user/' + id));
  }

  addUser(user: User) {
    return firstValueFrom(this.http.post<User>(this.url + this.module + '/user', JSON.stringify(user), { headers: this.headers }));
  }

  editUser(user: User) {
    return firstValueFrom(this.http.put<User>(this.url + this.module + '/user/' + user._id, JSON.stringify(user), { headers: this.headers }));
  }

  deleteUser(id: number) {
    return firstValueFrom(this.http.delete<User>(this.url + this.module + '/user/' + id));
  }
}
