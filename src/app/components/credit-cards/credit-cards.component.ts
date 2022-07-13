import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreditCard } from 'src/app/core/models/credit-card';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-credit-cards',
  templateUrl: './credit-cards.component.html',
  styleUrls: ['./credit-cards.component.scss']
})
export class CreditCardsComponent implements OnInit {
  public creditCardFormGroup:FormGroup
  public creditCardId = ''

  constructor(
    private creditCardService: CreditCardService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBarService: MatSnackBar
  ) { }

  public creditCards: CreditCard[] = []
  @ViewChild("createCardsTemplate") createCardRef: TemplateRef<any>;
  @ViewChild("deleteCardsTemplate") deleteCardRef: TemplateRef<any>;
  private createCardDialogRef: MatDialogRef<any, any>;
  
  ngOnInit() {
    this.listCards();
    this.initFormGroup();
  }
  
  createCreditCard(){
    if(this.creditCardFormGroup.valid) {
      const creditCard = this.creditCardFormGroup.value as CreditCard;
      this.creditCardService.createCreditCard(creditCard).subscribe((createdCard) => {
        this.createCardDialogRef.close();
        this.listCards();
        this.snackBarService.open('Criação de cartão concluida','Fechar', { verticalPosition: 'top', duration: 3000 });
      });
    }
  }

  updateCreditCard() {
    if(this.creditCardFormGroup.valid) {
      const creditCard = this.creditCardFormGroup.value as CreditCard;
      creditCard._id = this.creditCardId;
      this.creditCardService.updateCreditCard(creditCard).subscribe((createdCard) => {
        this.createCardDialogRef.close();
        this.listCards();
        this.snackBarService.open('Atualização de cartão concluida','Fechar',{ verticalPosition: 'top', duration: 3000 });
      });
    }
  }

  deleteCreditCard() {
    this.creditCardService.deleteCreditCard(this.creditCardId).subscribe(() => {
      this.closeDeleteModal();
      this.listCards();
      this.snackBarService.open('Exclusão de cartão concluida','Fechar', { verticalPosition: 'top', duration: 3000 });
    })
  }

  openModal() {
    this.creditCardId = null;
    this.creditCardFormGroup.reset();
    this.createCardDialogRef = this.dialog.open(this.createCardRef);
  }

  openEditModal(card:CreditCard) {
    this.creditCardId = card._id
    this.creditCardFormGroup.patchValue({
      name: card.name,
      dueDay: card.dueDay,
      closingDay: card.closingDay
    })
    this.createCardDialogRef = this.dialog.open(this.createCardRef);
  }

  openDeleteModal(creditCardId:string){
    this.creditCardId = creditCardId;
    this.createCardDialogRef = this.dialog.open(this.deleteCardRef);
  }

  closeModal() {
    this.createCardDialogRef.close(this.createCardRef)
  }

  closeDeleteModal() {
    this.createCardDialogRef.close(this.deleteCardRef);
  }

  initFormGroup() {
    this.creditCardFormGroup =  this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      closingDay: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      dueDay: ['', [Validators.required, Validators.min(1), Validators.max(30)]]
    });
  }

  listCards() {
    this.creditCardService.getCreditCards().subscribe({
      next: (responseCreditCards) => {
        this.creditCards = responseCreditCards
      }
    });
  }
}