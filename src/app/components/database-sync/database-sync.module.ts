import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseSyncComponent } from './database-sync.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatButtonModule,
        FlexLayoutModule
    ],
    providers: [],
    declarations: [DatabaseSyncComponent],
    exports: [DatabaseSyncComponent]
})
export class DatabaseSyncModule {
}
