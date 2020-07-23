import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddDatabaseComponent } from './add-database/add-database.component';
import { DatabaseChoiceComponent } from './database-choice/database-choice.component';

import { DatabaseConnectionPage } from './database-connection.page';
import { EditDatabaseComponent } from './edit-database/edit-database.component';

const routes: Routes = [
  {
    path: '',
    component: DatabaseConnectionPage,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'database-choice'},
      { path: 'database-choice', component: DatabaseChoiceComponent },
      { path: 'add-database', component: AddDatabaseComponent },
      { path: 'edit-database/:id', component: EditDatabaseComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatabaseConnectionPageRoutingModule {}
