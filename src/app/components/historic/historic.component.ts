import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreditCard } from 'src/app/core/models/credit-card';
import { Entry } from 'src/app/core/models/entry';
import { monthsNames } from 'src/app/core/months';
import { CreditCardService } from 'src/app/core/services/credit-card.service';
import { EntryService } from 'src/app/core/services/entry.service';

interface EntriesByMonth {
  monthDescription: string;
  month: number;
  year: number;
  entries: Entry[];
  totalCredit: number
  totalDebit: number;
  balance: number;
}

@Component({
  selector: 'app-historic',
  templateUrl: './historic.component.html',
  styleUrls: ['./historic.component.scss']
})
export class HistoricComponent implements OnInit {

  @Output() public onEntriesChanged = new EventEmitter<any>();

  private creditCardDetailsDialogRef: MatDialogRef<any, any>;
  private dialogRef: MatDialogRef<any, any>;
  private entryToDelete: Entry;
  constructor(
    private entriesService: EntryService,
    private creditCardService: CreditCardService,
    private snackBarService: MatSnackBar,
    private dialog: MatDialog
    ) { }

  @ViewChild("deleteManyDialogRef") deleteManyDialogRef: TemplateRef<any>;
  @ViewChild("creditCardDetailsRef") creditCardDetailsRef: TemplateRef<any>;
  public cardEntries: Entry[];
  public entriesByMonth: EntriesByMonth[] = [];
  public date: Date = new Date();
  public creditCards: CreditCard[] = [];

  async ngOnInit() {
    this.date.setDate(1);
    await this.getCreditCards();
    this.getEntries();
  }

  async getCreditCards() {
    this.creditCards = await this.creditCardService.getCreditCards().toPromise();
  }
  getEntries() {
    const date = new Date(this.date);

    for (let i = 0; i < 3; i++) {
      const month = date.getMonth();
      const year = date.getFullYear();

      this.entriesByMonth.unshift({
        monthDescription: `${monthsNames[month]} ${year}`,
        month: month,
        year: year,
        entries: [],
        totalCredit: 0,
        totalDebit: 0,
        balance: 0
      });

      date.setMonth(month - 1);
    }

    const initDate = new Date(date);
    initDate.setMonth(initDate.getMonth() + 1);
    initDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    this.entriesService.getEntries(initDate, endDate).subscribe({
      next: entries => {
        for (let newEntry of entries) {
          const dueDate = new Date(newEntry.dueDate);
          const entryMonth = dueDate.getMonth();
          const entryYear = dueDate.getFullYear();
          const entryByMonth = this.entriesByMonth.find(e => e.month === entryMonth && e.year === entryYear);

          if (!entryByMonth)
            continue;

          if (!newEntry.creditCardId) {
            entryByMonth.entries.push(newEntry);
          } else {
            let entry = entryByMonth.entries.find(e => e.creditCardId === newEntry.creditCardId && e.dueDate === newEntry.dueDate);

            if (!entry) {
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
              entry.value += newEntry.value;
            }
            entry.entries.push(newEntry);
          }
          
          let value = newEntry.value;
          let typeOfValue = newEntry.type;

          if (typeOfValue === 'C') {
            entryByMonth.totalCredit += value;
          } else {
            entryByMonth.totalDebit += value;
          }

          entryByMonth.balance = entryByMonth.totalCredit - entryByMonth.totalDebit;
        }
      }
    });
  }

  loadMoreEntries() {
    this.date.setMonth(this.date.getMonth() - 3);
    this.getEntries();
  }

  openCardDetails(entries: Entry[]) {
    this.cardEntries = entries;
    this.creditCardDetailsDialogRef = this.dialog.open(this.creditCardDetailsRef);
  }

  openDeleteDialog(entry: Entry) {
    this.dialogRef = this.dialog.open(this.deleteManyDialogRef);
    this.entryToDelete = entry;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  closeCardDetailsDialog() {
    this.creditCardDetailsDialogRef.close();
  }

  delete(deleteAll: number) {
    this.entriesService.delete(this.entryToDelete._id, deleteAll).subscribe({
      next: () => {
        this.snackBarService.open('Excluído com sucesso', 'Fechar', { verticalPosition: 'top', duration: 3000 });
        this.removeEntriesFromView(this.entryToDelete, deleteAll);
        this.dialog.closeAll();
        this.onEntriesChanged.emit();
      }, 
      error: () => {
        this.snackBarService.open('Erro ao excluir', 'Fechar', { verticalPosition: 'top', duration: 3000 });
      }
    })
  }

  removeEntriesFromView(entry:Entry, deleteAll:number) {
    if (deleteAll === 1) {
      for (let monthData of this.entriesByMonth) {
        monthData.entries = monthData.entries.filter(e => e.recurrenceId != entry.recurrenceId);
      }
    } else {
      for (let monthData of this.entriesByMonth) {
        monthData.entries = monthData.entries.filter(e => e._id != entry._id);
      }
    }
    this.recaulculateBalance();
  }

  recaulculateBalance() {
    for (let monthData of this.entriesByMonth) {
      monthData.totalCredit = 0;
      monthData.totalDebit = 0;
      monthData.balance = 0;
      for (let entry of monthData.entries) {
        if (entry.type == 'C') {
          monthData.totalCredit += entry.value;
          monthData.balance += entry.value;
        } else {
          monthData.totalDebit += entry.value;
          monthData.balance -= entry.value;
        }
      }
    }
  }
}
