import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/services/user.service';
@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  constructor(
    private userServices: UserService
  ) { }

  public usersData: User[] = [];
  
  ngOnInit() {
    this.getUsers();
  }
  
 async getUsers(){
    this.usersData = await this.userServices.getAllUsers().toPromise();
  }
}
