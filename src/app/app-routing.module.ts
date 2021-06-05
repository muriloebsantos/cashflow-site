import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashflowComponent } from './components/cashflow/cashflow.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from './core/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: CashflowComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
