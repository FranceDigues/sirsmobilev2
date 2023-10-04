import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { SyncService } from 'src/app/services/sync.service';

@Component({
  selector: 'left-slide-synchronisation',
  templateUrl: './database-sync.component.html',
  styleUrls: ['./database-sync.component.scss'],
})
export class DatabaseSyncComponent implements OnInit {

  constructor(public syncService: SyncService,
              private router: Router,
              public dbService: DatabaseService) { }

  ngOnInit() { }

  launch() {
    const isFirstSync = false;

    this.syncService.sync(isFirstSync).then();
  }

  cancelSync() {
    this.syncService.cancelSync();
  }

  goBack() {
    this.router.navigateByUrl('/main').then();
  }
}
