import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SyncService } from '../../../services/sync.service';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { LoadingController } from '@ionic/angular';
import { SirsDataService } from '../../../services/sirs-data.service';

@Component({
    selector: 'app-firstsync',
    templateUrl: './firstsync.component.html',
    styleUrls: ['./firstsync.component.scss'],
})
export class FirstsyncComponent implements OnInit {

    @Output() backPressed: EventEmitter<void> = new EventEmitter<void>();

    constructor(public syncService: SyncService, public router: Router,
                public dbService: DatabaseService,
                private loadingCtrl: LoadingController,
                private sirsDataService: SirsDataService) {
    }

    ngOnInit() {
        this.syncService.sync(true)
            .then(async () => {
                    const loading = await this.loadingCtrl.create({
                        message: 'Déploiement en cours ...'
                    });
                    await loading.present();
                    await this.sirsDataService.loadDataFromDB();
                    await this.router.navigateByUrl('/main');
                    await loading.dismiss();
                },
                (error) => {
                    console.error(error);
                }
            );
    }

    public onBackPressed(): void {
        this.backPressed.next();
    }

}
