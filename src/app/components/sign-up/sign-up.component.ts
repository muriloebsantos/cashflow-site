import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  public formGroup: FormGroup;
  @Output()
  public onUserCreated = new EventEmitter<any>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBarService: MatSnackBar
  ) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      userName: ["", [Validators.required, Validators.maxLength(50)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.maxLength(50)]],
      confirmPassword: ["", [Validators.required, Validators.maxLength(50)]]
    }) 
  }

  createAcount() {
    this.formGroup.markAllAsTouched();

    if(this.formGroup.value.password !== this.formGroup.value.confirmPassword) {
      this.snackBarService.open('As Senhas não conferem','Fechar', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    if(!this.formGroup.valid) {
      return;
    }

    this.userService.createUser(this.formGroup.value).subscribe({
      next: (response) => {
        this.snackBarService.open('Criação de Usuario concluida','Fechar', { verticalPosition: 'top', duration: 3000 });
        localStorage.setItem("exp", response.expiration);
        localStorage.setItem("cashflow_token", response.token);
        this.onUserCreated.emit();
        this.router.navigate(['']);
      },
      error: (errorResponse: HttpErrorResponse) => {
        if(errorResponse.status === 400 || errorResponse.status === 409) {
          this.snackBarService.open(errorResponse.error.error,'Fechar', { verticalPosition: 'top', duration: 3000 });
        }
      }
    })
  }
}
