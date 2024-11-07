import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CreditCard } from 'src/app/core/models/credit-card';
import { Entry } from 'src/app/core/models/entry';
import { User } from 'src/app/core/models/user';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { EntryService } from 'src/app/core/services/entry.service';
import { UserService } from 'src/app/core/services/user.service';
import { UntypedFormBuilder, UntypedFormGroup, FormGroupDirective, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { monthsNames } from 'src/app/core/months';

interface EntriesByMonth {
  monthDescription: string;
  month: number;
  year: number;
  entries: Entry[];
  totalMonth: number;
}

@Component({
  selector: 'app-cashflow',
  templateUrl: './cashflow.component.html',
  styleUrls: ['./cashflow.component.scss']
})

export class CashflowComponent implements OnInit {

  public balance: number = 0;
  public savings: number = 0;
  public balanceEdit: number;
  public isGettingBalance;
  public entriesByMonth: EntriesByMonth[] = [];
  public creditCards: CreditCard[] = [];
  public date: Date;
  public formGroup: UntypedFormGroup;
  public formGroupEdition: UntypedFormGroup;
  public formGroupBalance: UntypedFormGroup;
  
  
  public recurrences = [
    { id: 'W', description: 'Semanalmente' },
    { id: 'F', description: 'Quinzenalmente' },
    { id: 'M', description: 'Mensalmente' },
    { id: 'Y', description: 'Anualmente' },
  ];

  public invoices: Date[] = [];
  public cardEntries: Entry[];
  public entryToEdit: Entry;
  public isAdmin: boolean = false;


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
              private fb: UntypedFormBuilder,
              private snackBarService: MatSnackBar,
              private dialog: MatDialog
    ) { }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.initFormGroup();
    this.initDate();
    this.addEntriesByMonth(true);
    this.isAdmin = this.userService.isAdmin();

    const pendingEntriesObservable = this.entriesService.getPendingEntries(this.date.getMonth() + 1, this.date.getFullYear(), 1);

    this.isGettingBalance = true;
    
    await this.listCards();
    await this.getBalance();

    forkJoin([pendingEntriesObservable]).subscribe({
     next: results => {
       this.addPendingEntriesToView(results[0]);
     }
   }); 
  }

  async getBalance() {
   const user =  await this.userService.getUser().toPromise();
   this.setBalance(user);
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
      showRecurrenceNumber: [false],
      commitEntries: [false]
    });

    this.formGroupBalance = this.fb.group({
      newBalance: [null, [Validators.required]],
      newSavings: [null, [Validators.required]],
      createEntry: [false]
    });
  }

  setBalance(user: User) {
    this.balance = user.balance;
    this.savings = user.savings;
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
      entries: [],
      totalMonth: 0
    });
   }

    for(let i = 0; i < 3; i++) {
      const month = date.getMonth();
      const year = date.getFullYear();

      this.entriesByMonth.push({
        monthDescription: `${monthsNames[month]} ${year}`,
        month: month,
        year: year,
        entries: [],
        totalMonth: 0
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
            type: newEntry.type,
            value: newEntry.value,
            creditCardId: newEntry.creditCardId,
            entries: []
          };

          entryByMonth.entries.push(entry);

        } else {
          if(newEntry.type == 'D') {
            entry.value+= newEntry.value;
          } else {
            entry.value-= newEntry.value;
          }
        }

        if(entry.value >= 0) {
          entry.type = 'D';
        } else {
          entry.type = 'C';
          entry.value = entry.value * -1;
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
      entryByMonth.totalMonth = prevision + this.savings;
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

    for(let i = 0; i < 12; i++) {
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

    if(this.formGroup.value.recurrenceNumber > 360){
      this.formGroup.controls['recurrenceNumber'].setErrors({'incorrect': true});
      this.snackBarService.open('Recorrência maior que 360, inválido', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      return;
    }

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

    entryRequest.isPaid = false;
    this.entriesService.saveEntry(entryRequest).subscribe({
      next: () => {
        formDirective.resetForm();
        this.formGroup.reset();
        this.formGroup.patchValue({
          type: 'D'
        });
        this.refresh();
        this.snackBarService.open('Salvo com sucesso', 'Fechar', { verticalPosition: 'top', duration: 3000 });
        if(entryRequest.commitEntries) {
          this.getBalance()
        }
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

  listCards() {
    this.creditCardsService.getCreditCards().subscribe({
      next: (responseCreditCards) => {
        this.creditCards = responseCreditCards
      }
    });
  }

  updateBalance() {
    if(!this.formGroupBalance.valid) {
      return;
    }

    const newBalance = this.formGroupBalance.value.newBalance;
    const newSavings = this.formGroupBalance.value.newSavings;
    const createEntry = this.formGroupBalance.value.createEntry;

    this.userService.updateBalance(newBalance, newSavings, createEntry).subscribe({
      next: () => {
        this.snackBarService.open('Saldo atualizado', 'Fechar', { verticalPosition: 'top', duration: 3000 });
        this.balance = newBalance;
        this.savings = newSavings;
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
    this.formGroupBalance.patchValue({
      newBalance: this.balance,
      newSavings: this.savings
    })
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
