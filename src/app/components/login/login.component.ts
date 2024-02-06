import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public formGroup: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              private tokenService: TokenService,
              private router: Router,
              private dialog: MatDialog,
              private snackBarService: MatSnackBar
              ) { }

  @ViewChild("createUserTeplate") createSignUpCardRef: TemplateRef<any>;
  private createCardDialogRef: MatDialogRef<any, any>;
              
  ngOnInit() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    this.formGroup.markAllAsTouched();

    if(!this.formGroup.valid) {
      return;
    }

    const email = this.formGroup.value.email;
    const password = this.formGroup.value.password;

    this.tokenService.createToken(email, password).subscribe({
      next: response => {
        localStorage.setItem("cashflow_token", response.token);
        localStorage.setItem("exp", response.expiration);
        this.router.navigate(['']);
      },
      error: err => {
        const errorMsg = err.error.error; 
        this.snackBarService.open(errorMsg, 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    });
  }

  openSignUpModal() {
    this.createCardDialogRef = this.dialog.open(this.createSignUpCardRef,{
      width: "500px"
    })
  }

  closeSignUpModal() {
    this.createCardDialogRef.close();
  }
}
