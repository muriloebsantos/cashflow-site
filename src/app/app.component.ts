import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cash-flow-site';
  constructor(
    private router: Router
  ) {}
  ngOnInit() {
  }


  logoutSystem() {
    localStorage.clear()
    this.router.navigate(['/login'])
  }

  isLoggedIn() {
    return !!localStorage.getItem("cashflow_token"); 
  }
}
