import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CreditCard } from 'src/app/core/models/credit-card';
import { Entry } from 'src/app/core/models/entry';
import { User } from 'src/app/core/models/user';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { EntryService } from 'src/app/core/services/entry.service';
import { UserService } from 'src/app/core/services/user.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

interface EntriesByMonth {
  monthDescription: string;
  month: number;
  year: number;
  entries: Entry[]
}

@Component({
  selector: 'app-cashflow',
  templateUrl: './cashflow.component.html',
  styleUrls: ['./cashflow.component.scss']
})

export class CashflowComponent implements OnInit {

  public balance: number;
  public balanceEdit: number;
  public isGettingBalance;
  public entriesByMonth: EntriesByMonth[] = [];
  public creditCards: CreditCard[] = [];
  public date: Date;
  public formGroup: FormGroup;
  public formGroupEdition: FormGroup;
  public formGroupBalance: FormGroup;
  
  
  public recurrences = [
    { id: 'W', description: 'Semanalmente' },
    { id: 'F', description: 'Quinzenalmente' },
    { id: 'M', description: 'Mensalmente' },
    { id: 'Y', description: 'Anualmente' },
  ];

  public invoices: Date[] = [];
  public cardEntries: Entry[];
  public entryToEdit: Entry;

  private monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                        ];

  private entryToDelete: Entry;

  private dialogRef: MatDialogRef<any, any>;
  private creditCardDetailsDialogRef: MatDialogRef<any, any>;
  private editEntryDialogRef: MatDialogRef<any, any>;
  private editBalanceDialogRef: MatDialogRef<any, any>;


  @ViewChild("deleteManyDialogRef") deleteManyDialogRef: TemplateRef<any>;
  @ViewChild("deleteDialogRef") deleteDialogRef: TemplateRef<any>;
  @ViewChild("creditCardDetailsRef") creditCardDetailsRef: TemplateRef<any>;
  @ViewChild("editEntryRef") editEntryRef: TemplateRef<any>;
  @ViewChild("editBalanceRef") editBalanceRef: TemplateRef<any>;
  
  constructor(private userService: UserService,
              private entriesService: EntryService,
              private creditCardsService: CreditCardService,
              private fb: FormBuilder,
              private snackBarService: MatSnackBar,
              private dialog: MatDialog
    ) { }

  ngOnInit() {

    this.initFormGroup();
    this.initDate();
    this.addEntriesByMonth(true);

    const userObservable = this.userService.getUser();
    const creditCardsObservable = this.creditCardsService.getCreditCards();
    const pendingEntriesObservable = this.entriesService.getPendingEntries(this.date.getMonth() + 1, this.date.getFullYear(), 1);

   this.isGettingBalance = true;

   forkJoin([userObservable, creditCardsObservable, pendingEntriesObservable]).subscribe({
     next: results => {
       this.setBalance(results[0]);
       this.setCreditCards(results[1]);
       this.addPendingEntriesToView(results[2]);
     }
   });
  }

  initFormGroup() {
    this.formGroup = this.fb.group({
      type: ['D', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(100)]],
      dueDate:  ['', [Validators.required]],
      value: [0, [Validators.required]],
      creditCardId: [''],
      invoice: [''],
      recurrenceType: [''],
      recurrenceNumber: [''],
      showRecurrenceNumber: [false]
    });

    this.formGroupBalance = this.fb.group({
      newBalance: [null, [Validators.required]]
    });
  }

  setBalance(user: User) {
    this.balance = user.balance;
    this.isGettingBalance = false;
  }

  setCreditCards(creditCards: CreditCard[]) {
    this.creditCards = creditCards;
  }

  initDate() {
    this.date = new Date();
    this.date.setDate(1);
  }

  addEntriesByMonth(overdue: boolean) {
    const date = new Date(this.date);

   if(overdue) {
    this.entriesByMonth.push({
      monthDescription: 'Atrasados',
      month: -1,
      year: -1,
      entries: []
    });
   }

    for(let i = 0; i < 3; i++) {
      const month = date.getMonth();
      const year = date.getFullYear();

      this.entriesByMonth.push({
        monthDescription: `${this.monthsNames[month]} ${year}`,
        month: month,
        year: year,
        entries: []
      });

      date.setMonth(month + 1);
    }
  }

  addPendingEntriesToView(newEntries: Entry[]) {

    newEntries.forEach(newEntry => {

      const date = new Date(newEntry.dueDate);
      const month = date.getMonth();
      const year = date.getFullYear();
      const entryByMonth = 
          this.entriesByMonth.find(e => e.year === year && e.month === month) || 
          this.entriesByMonth.find(e => e.year === -1 && e.month == -1);

      if(!newEntry.creditCardId) {
        entryByMonth.entries.push(newEntry);
      } else {
        let entry = entryByMonth.entries.find(e => e.creditCardId === newEntry.creditCardId && e.dueDate === newEntry.dueDate);

        if(!entry) {
          entry = {
            dueDate: newEntry.dueDate,
            description: this.creditCards.find(c => c._id === newEntry.creditCardId).name,
            type: 'D',
            value: newEntry.value,
            creditCardId: newEntry.creditCardId,
            entries: []
          };

          entryByMonth.entries.push(entry);

        } else {
          entry.value+= newEntry.value;
        }

        entry.entries.push(newEntry);
      } 
    });

    this.calcBalance();
  }

  calcBalance() {
    let prevision = this.balance;

    this.entriesByMonth.forEach(entryByMonth => {
      entryByMonth.entries.forEach(entry => {
        if(entry.type === 'C') {
          prevision+= entry.value;
        } else {
          prevision-= entry.value;
        } 
        entry.prevision = prevision;
      });
    });
  }

  getEntries(includeOverdue: number) {
    this.entriesService.getPendingEntries(this.date.getMonth() + 1, this.date.getFullYear(), includeOverdue).subscribe({
      next: newEntries => {
        this.addPendingEntriesToView(newEntries);
      }
    });
  }

  refresh() {
    this.entriesByMonth = [];
    this.initDate();
    this.addEntriesByMonth(true);
    this.getEntries(1);
  }

  setInvoices(creditCardId: string) {
    this.formGroup.patchValue({ invoice: null });

    if(!creditCardId) {
      this.invoices = [];
      return;
    }

    const invoices: Date[] = [];
    const dueDay = this.creditCards.find(c => c._id === creditCardId).dueDay;
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - 1);
    date.setDate(dueDay);

    for(let i = 0; i < 3; i++) {
      invoices.push(new Date(date));

      date.setMonth(date.getMonth() + 1);
    }

    this.invoices = invoices;
    
  }

  save(formDirective: FormGroupDirective) {
    this.formGroup.markAllAsTouched();

    if(!this.formGroup.valid) {
      return;
    }

    const entryRequest = this.formGroup.value as Entry;
    const invoiceDate = this.formGroup.value.invoice;

    if(entryRequest.creditCardId && !invoiceDate) {
      this.formGroup.controls['invoice'].setErrors({'incorrect': true});
      this.snackBarService.open('Selecione a fatura', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    if(entryRequest.recurrenceType && !entryRequest.recurrenceNumber) {
      this.formGroup.controls['recurrenceNumber'].setErrors({'incorrect': true});
      this.snackBarService.open('Informe a quantidade de recorrências', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      return;
    }
    
    // convert date to UTC
    entryRequest.dueDate = moment(entryRequest.dueDate).utc().toDate();

    if(entryRequest.creditCardId) {
      const dueDate = entryRequest.dueDate;
      entryRequest.dueDate = moment(invoiceDate).utc().toDate();
      entryRequest.purchaseDate = dueDate;
    }

    this.entriesService.saveEntry(entryRequest).subscribe({
      next: () => {
        formDirective.resetForm();
        this.formGroup.reset();
        this.formGroup.patchValue({
          type: 'D'
        });
        this.refresh();
        this.snackBarService.open('Salvo com sucesso', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      },
      error: () => {
        this.snackBarService.open('Erro ao salvar', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    });
  }

  update() {
    this.formGroupEdition.markAllAsTouched();

    if(!this.formGroupEdition.valid) {
      return;
    }

    const entryRequest = this.formGroupEdition.value;
    const updateAll = entryRequest.updateAll;

    delete entryRequest.updateAll;

    // convert date to UTC
    entryRequest.dueDate = moment(entryRequest.dueDate).utc().toDate();

    this.entriesService.updateEntry(this.entryToEdit._id, entryRequest, updateAll).subscribe({
      next: () => {
        this.snackBarService.open('Atualizado com sucesso', 'Fechar', { verticalPosition: 'top', duration: 3000 });
        this.dialog.closeAll();
        this.refresh();
      },
      error: () => {
        this.snackBarService.open('Erro ao atualizar', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    });
  }

  updateBalance() {
    if(!this.formGroupBalance.valid) {
      return;
    }

    const newBalance = this.formGroupBalance.value.newBalance;

    this.userService.updateBalance(newBalance).subscribe({
      next: () => {
        this.snackBarService.open('Saldo atualizado', 'Fechar', { verticalPosition: 'top', duration: 3000 });
        this.balance = newBalance;
        this.calcBalance();
        this.closeEditBalance();
      }, 
      error: () => {
        this.snackBarService.open('Erro ao atualizar saldo', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    })
  }

  loadMoreEntries() {
    this.date.setMonth(this.date.getMonth() + 3);
    this.addEntriesByMonth(false);
    this.getEntries(0);
  }

  commitEntry(entry: Entry, entryMonth: EntriesByMonth) {
    let ids: string[];

    if(!entry.creditCardId) {
      ids = [entry._id];
    } else {
      ids = entry.entries.map(e => e._id);
    }

    this.entriesService.commitEntry(ids).subscribe({
      next: () => {
        this.snackBarService.open('Efetivado com sucesso', 'Fechar', { verticalPosition: 'top', duration: 3000 });

        if(entry.type == 'C') {
            this.balance+= entry.value;
        } else {
          this.balance-= entry.value;
        }

        entryMonth.entries = entryMonth.entries.filter(e => e._id !== entry._id);

        this.calcBalance();

      },
      error: () => {
        this.snackBarService.open('Erro ao efetivar', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    })
  }

  openDeleteDialog(entry: Entry) {
    if(entry.recurrenceId) {
      this.dialogRef = this.dialog.open(this.deleteManyDialogRef);
    } else {
      this.dialogRef = this.dialog.open(this.deleteDialogRef);
    }
    this.entryToDelete = entry;
  }

  delete(deleteAll: number) {
    this.entriesService.delete(this.entryToDelete._id, deleteAll).subscribe({
      next: () => {
        this.snackBarService.open('Excluído com sucesso', 'Fechar', { verticalPosition: 'top', duration: 3000 });
        this.refresh();
        this.dialog.closeAll();
      }, 
      error: () => {
        this.snackBarService.open('Erro ao excluir', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    })
  }
  
  openCardDetails(entries: Entry[]) {
    this.cardEntries = entries;
    this.creditCardDetailsDialogRef = this.dialog.open(this.creditCardDetailsRef);
  }

  openEditEntry(entry: Entry) {
    this.formGroupEdition = this.fb.group({
      updateAll: ['0'],
      type: [entry.type],
      description: [entry.description, [Validators.required, Validators.maxLength(100)]],
      value: [entry.value],
      dueDate: [moment(entry.dueDate).format('yyyy-MM-DD')]
    });

    this.entryToEdit = entry;
    this.editEntryDialogRef = this.dialog.open(this.editEntryRef);
  }

  openEditBalance() {
    this.formGroupBalance.reset();
    this.editBalanceDialogRef = this.dialog.open(this.editBalanceRef);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  closeCreditCardDetails() {
    this.creditCardDetailsDialogRef.close();
  }

  closeEditEntry() {
    this.editEntryDialogRef.close();
  }

  closeEditBalance() {
    this.editBalanceDialogRef.close();
  }
}
