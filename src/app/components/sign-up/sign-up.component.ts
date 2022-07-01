import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBarService: MatSnackBar
  ) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      userName: ["", Validators.required, Validators.maxLength(50)],
      email: ["", Validators.required ,Validators.email],
      password: ["", Validators.required, Validators.maxLength(50)],
      confirmPassword: ["", Validators.required, Validators.maxLength(50)]
    }) 
  }

  createAcount() {
    this.formGroup.markAllAsTouched();
    if(!this.formGroup.valid) {
      return;
    }
    this.userService.createUser(this.formGroup.value).subscribe(() => {
      this.snackBarService.open('Criação de Usuario concluida','Fechar', { verticalPosition: 'top', duration: 3000 });
    })
  
  }

}
