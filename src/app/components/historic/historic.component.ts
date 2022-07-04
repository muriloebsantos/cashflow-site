import { Component, OnInit } from '@angular/core';
import { Entry } from 'src/app/core/models/entry';
import { monthsNames } from 'src/app/core/months';
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

  constructor(
    private entriesService: EntryService
  ) { }

  public entriesByMonth: EntriesByMonth[] = [];
  public date: Date = new Date();

  ngOnInit() {
    this.date.setDate(1);
    this.getEntries();
  }

  getEntries() {
    const date = new Date(this.date);
 
     for(let i = 0; i < 3; i++) {
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

       }
     });
  }

  loadMoreEntries() {
    this.date.setMonth(this.date.getMonth() - 3);
    this.getEntries()
  }
}
