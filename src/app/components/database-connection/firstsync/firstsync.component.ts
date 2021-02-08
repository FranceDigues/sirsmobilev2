import { Component, OnInit } from '@angular/core';
import { SyncService } from '../../../services/sync.service';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-firstsync',
  templateUrl: './firstsync.component.html',
  styleUrls: ['./firstsync.component.scss'],
})
export class FirstsyncComponent implements OnInit {

  constructor(public syncService: SyncService, public router: Router,
              public dbService: DatabaseService) { }

  ngOnInit() {
    const isFirstSync = true;

    this.syncService.sync(isFirstSync)
    .then(
      () => {
        console.error('Le status est de ', this.syncService.status);
        setTimeout(() => {
          this.router.navigateByUrl('/main');
        }, 1300);
      },
      (error) => {
        console.error(error);
      }
    );
  }

}
