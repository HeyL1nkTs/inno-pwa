import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { JwtService } from '../../../generalServices/jwt.service';
import { LoadingComponent } from '../../../generalServices/loading/loading.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatOptionModule,
    TooltipDirective,
    MatSelectModule,
    LoadingComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  userForm: FormGroup;
  users: User[] = [];
  isEditing = false;
  editingUserId: number | null = null;
  showForm = false;
  displayedColumns = ['name', 'username', 'email', 'phone', 'actions'];
  wip = false;

  constructor(private fb: FormBuilder, private userService: UserService, private jwt: JwtService) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.minLength(6)]],
      phone: ['', [Validators.pattern('^[0-9]+$'), Validators.required]],
      email: ['', [Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  async getUsers() {
    try {
      this.wip = true;
      const user = this.jwt.getPayloadWithtokenStorage();
      const users = await this.userService.getUsers(user._id);
      this.users = users;
      this.wip = false;
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se pudo obtener la lista de usuarios',
      }).then(() => {
        this.wip = false;
      });
    }
  }

  async onSubmit() {
    try {
      this.wip = true;
      if (this.userForm.valid) {
        if (this.isEditing) {
          const editedUser = this.userForm.value;
          editedUser._id = this.editingUserId;
          console.log(editedUser);
          const data = await this.userService.editUser(editedUser);
          if (data) {
            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              this.userForm.reset();
              this.showForm = false;
              this.wip = false;
              this.getUsers();
            })
          }
        } else {
          const data = await this.userService.addUser(this.userForm.value);
          if (data) {
            Swal.fire({
              icon: 'success',
              title: 'Usuario agregado',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              this.userForm.reset();
              this.showForm = false;
              this.wip = false;
              this.getUsers();
            })
          }
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Por favor, rellene todos los campos',
        }).then(() => {
          this.wip = false;
        });
      }

    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se pudo obtener la lista de usuarios',
      }).then(()=>{
        this.wip = false;
      });
    }
  }

  editUser(user: User) {
    this.isEditing = true;
    this.editingUserId = user._id;
    this.userForm.patchValue(user);
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.showForm = true;
  }

  async deleteUser(user: User) {
    try {
      this.wip = true;
      const data = await this.userService.deleteUser(user._id);
      if (data) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.wip = false;
          this.getUsers();
        })
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se pudo eliminar el usuario',
      }).then(() => {
        this.wip = false;
      });
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required]);
  }
}
