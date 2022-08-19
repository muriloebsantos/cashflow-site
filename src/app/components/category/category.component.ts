import { Component, OnInit, ViewChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})


export class CategoryComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
  ) { }

  @ViewChild("CreateCategoryModal") createCardRef: TemplateRef<any>;
  @ViewChild("EditCategoryModal") EditCardRef: TemplateRef<any>;
  @ViewChild("DeleteCategoryModal") DeleteCardRef: TemplateRef<any>;
  private createCardDialogRef: MatDialogRef<any, any>;
  public FakeCredit
  public categories = [{name:"#BirthDay"},{name:"#Crypto Actives"},{name:"#Elong Munsk"},{name:"#SpaceX"}] // FakeTest
  ngOnInit() {
  }

  public openCreateModal() {
    this.createCardDialogRef = this.dialog.open(this.createCardRef)
  }


  public openEditModal() {
    this.createCardDialogRef = this.dialog.open(this.EditCardRef)
  }


  public openDeleteModal() {
    this.createCardDialogRef = this.dialog.open(this.DeleteCardRef)
  }
}
