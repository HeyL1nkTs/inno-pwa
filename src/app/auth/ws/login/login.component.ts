import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../admin/html/loading/loading.component';
import { PopComponent } from '../../../admin/html/pop/pop.component';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { JwtService } from '../../../generalServices/jwt.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIcon, TooltipDirective,
    PopComponent, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    ReactiveFormsModule, FormsModule,
    MatCheckbox, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  form: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private jwt: JwtService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  process() {
    if (this.form.valid) {
      this.auth.login(this.form.value).subscribe((res: any) => {
        this.auth.saveToken(res.token);
        const user = this.jwt.getPayload(res.token);
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        }
        else if (user.role === 'seller') {
          this.router.navigate(['/client']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid user role!',
          })
        }
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.message,
        })
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please check the fields!',
      })
    }
  }

}
