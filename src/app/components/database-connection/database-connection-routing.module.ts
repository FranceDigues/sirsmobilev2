import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatabaseConnectionPage } from './database-connection.page';

const routes: Routes = [
  {
    path: '',
    component: DatabaseConnectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatabaseConnectionPageRoutingModule {}
