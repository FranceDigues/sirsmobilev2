import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-database-choice',
  templateUrl: './database-choice.component.html',
  styleUrls: ['./database-choice.component.scss', '../database-connection.page.scss'],
})
export class DatabaseChoiceComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

  addDatabase() {
    this.router.navigateByUrl('/database-connection/add-database');
  }

}
