import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreditCard } from 'src/app/core/models/credit-card';
import { CreditCardService } from 'src/app/core/services/credit-card.service';

@Component({
  selector: 'app-credit-cards',
  templateUrl: './credit-cards.component.html',
  styleUrls: ['./credit-cards.component.scss']
})
export class CreditCardsComponent implements OnInit {
  public formCreateCard:FormGroup

  constructor(
    private creditCardService: CreditCardService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  public creditCards: CreditCard[] = []
  @ViewChild("createCardsTemplate") createCardRef: TemplateRef<any>;
  private createCardDialogRef: MatDialogRef<any, any>;
  
  ngOnInit() {
    this.listCards()
    this.initFormGroup()
  }
  
  createCreditCard(){
    if(this.formCreateCard.valid) {
      const creditCard = this.formCreateCard.value as CreditCard;
      this.creditCardService.createCreditCard(creditCard).subscribe((createdCard) => {
        this.createCardDialogRef.close();
        this.listCards()
      })
    }
  }

  openModal() {
    this.createCardDialogRef = this.dialog.open(this.createCardRef);
  }

  initFormGroup() {
    this.formCreateCard =  this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      closingDay: ['', [Validators.required , Validators.maxLength(31), Validators.minLength(1)]],
      dueDay: ['', [Validators.required , Validators.maxLength(31), Validators.minLength(1)]]
    })
  }

  listCards() {
    this.creditCardService.getCreditCards().subscribe({
      next: (responseCreditCards) => {
        this.creditCards = responseCreditCards

      }
    })
  }
}