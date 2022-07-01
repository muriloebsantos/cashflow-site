import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './core/material.module';
import { AuthGuardService } from './core/auth-guard.service';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { CashflowComponent } from './components/cashflow/cashflow.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from './core/services/user.service';
import { EntryService } from './core/services/entry.service';
import { CreditCardService } from './core/services/credit-card.service';
import { CurrencyMaskInputMode, NgxCurrencyModule } from "ngx-currency";
import { TokenService } from './core/services/token.service';
import { CreditCardsComponent } from './components/credit-cards/credit-cards.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

export const customCurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: ".",
  nullable: true,
  min: null,
  max: null,
  inputMode: CurrencyMaskInputMode.FINANCIAL
};


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CashflowComponent,
    CreditCardsComponent,
    SignUpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig)
  ],
  providers: [AuthGuardService, UserService, EntryService, CreditCardService, TokenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
