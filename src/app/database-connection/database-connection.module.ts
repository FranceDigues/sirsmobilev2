import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddDatabaseComponent } from './add-database/add-database.component';
import { DatabaseChoiceComponent } from './database-choice/database-choice.component';
import { DatabaseConnectionPageRoutingModule } from './database-connection-routing.module';
import { DatabaseConnectionPage } from './database-connection.page';
import { EditDatabaseComponent } from './edit-database/edit-database.component';
import { FirstsyncComponent } from './firstsync/firstsync.component';
import { LoginDatabaseComponent } from './login-database/login-database.component';
import { ReplicateDatabaseComponent } from './replicate-database/replicate-database.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DatabaseConnectionPageRoutingModule,
    FlexLayoutModule
  ],
  providers: [
  ],
  declarations: [DatabaseConnectionPage, AddDatabaseComponent, DatabaseChoiceComponent, EditDatabaseComponent,
    ReplicateDatabaseComponent, LoginDatabaseComponent, FirstsyncComponent]
})
export class DatabaseConnectionPageModule {}
