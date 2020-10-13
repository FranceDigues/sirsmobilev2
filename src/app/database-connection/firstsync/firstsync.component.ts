import { Component, OnInit } from '@angular/core';
import { SyncService } from '../../sync.service';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/database.service';

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
        console.log('Le status est de ', this.syncService.status);
        setTimeout(() => {
          this.router.navigateByUrl('/main');
        }, 1300);
      },
      (error) => {
        console.log(error);
      }
    );
  }

}
