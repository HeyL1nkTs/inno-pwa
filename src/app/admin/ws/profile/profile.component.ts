import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { LoadingComponent } from '../../html/loading/loading.component';
import { PopComponent } from '../../html/pop/pop.component';
import { JwtService } from '../../../generalServices/jwt.service';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { InternetService } from '../../services/internet.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatIcon, TooltipDirective,
    PopComponent, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    ReactiveFormsModule, FormsModule,
    MatCheckbox, LoadingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  name: string = 'Name';
  email: string = 'Email';
  phone: string = 'Phone';
  profile_picture: string = '/avatar.jpg';
  password: string = '';
  data: any;

  constructor(private tokenInfo: JwtService, private userService: UserService,
    private router: Router, private internetServie: InternetService) { }

  ngOnInit(){
    //this.alertMessage();
    this.getDataFromToken();
  }

  alertMessage(){
    Swal.fire({
      icon: 'info',
      title: 'This screen is only available with internet connection',
      text: 'If you don\'t have internet connection, you can\'t change your profile data',
    }).then(() => {
      if(!this.internetServie.isOnlineStatus()){
        Swal.fire({
          icon: 'error',
          title: 'You must have internet connection to change your profile data!',
          text: 'You will be redirected to the main screen',
        }).then(()=>{
          this.router.navigate(['/admin']);
        })
      }
    })
  }

  getDataFromToken(){
    this.data = this.tokenInfo.getPayload(localStorage.getItem('token'));
    this.name = this.data.name;
    this.email = this.data.email;
    this.phone = this.data.phone;
    console.log(this.data);
  }

  change(param: string){

    Swal.fire({
      title: 'Are you sure?',
      text: 'Any change will end your session!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeDataProcess(param);
      }
    })
  }

  changeDataProcess(param: string){
    let request

    switch(param){
      case 'name':
        console.log('change name to ' + this.name);
        request = {
          name: this.name
        }
        this.userService.updateProfile(this.data._id, JSON.stringify(request)).subscribe((res) => {
          Swal.fire({
            icon: 'success',
            title: 'Name changed successfully',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 2500
          }).then(() => {
            this.router.navigate(['/auth/logout']);
          });
        })
        break;
      case 'email':
        console.log('change email to ' + this.email);
        request = {
          email: this.email
        }
        this.userService.updateProfile(this.data._id, JSON.stringify(request)).subscribe((res) => {
          Swal.fire({
            icon: 'success',
            title: 'Email changed successfully',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 2500
          }).then(() => {
            this.router.navigate(['/auth/logout']);
          });
        })
        break;
      case 'phone':
        console.log('change phone to ' + this.phone);
        request = {
          phone: this.phone
        }
        this.userService.updateProfile(this.data._id, JSON.stringify(request)).subscribe((res) => {
          Swal.fire({
            icon: 'success',
            title: 'Phone changed successfully',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 2500
          }).then(() => {
            this.router.navigate(['/auth/logout']);
          });
        })
        break;
      case 'password':
        console.log('change password to ' + this.password);
        request = {
          password: this.password
        }
        this.userService.updateProfile(this.data._id, JSON.stringify(request)).subscribe((res) => {
          Swal.fire({
            icon: 'success',
            title: 'Password changed successfully',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 2500
          }).then(() => {
            this.router.navigate(['/auth/logout']);
          });
        })
        break;
    }
  }

}
