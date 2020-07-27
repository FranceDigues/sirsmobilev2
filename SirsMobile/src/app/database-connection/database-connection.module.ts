import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatabaseConnectionPageRoutingModule } from './database-connection-routing.module';

import { DatabaseConnectionPage } from './database-connection.page';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddDatabaseComponent } from './add-database/add-database.component';
import { DatabaseChoiceComponent } from './database-choice/database-choice.component';
import { IonicStorageModule } from '@ionic/storage';
import { EditDatabaseComponent } from './edit-database/edit-database.component';
import { ReplicateDatabaseComponent } from './replicate-database/replicate-database.component';
import { DatabaseService } from '../database.service';

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
    DatabaseService,
  ],
  declarations: [DatabaseConnectionPage, AddDatabaseComponent, DatabaseChoiceComponent, EditDatabaseComponent, ReplicateDatabaseComponent]
})
export class DatabaseConnectionPageModule {}
