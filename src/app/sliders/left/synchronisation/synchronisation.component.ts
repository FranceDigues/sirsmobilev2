import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { SyncService } from 'src/app/services/sync.service';

@Component({
  selector: 'left-slide-synchronisation',
  templateUrl: './synchronisation.component.html',
  styleUrls: ['./synchronisation.component.scss'],
})
export class LeftSlideSynchronisationComponent implements OnInit {

  constructor(public syncService: SyncService,
              private router: Router,
              public dbService: DatabaseService) { }

  ngOnInit() { }

  launch() {
    const isFirstSync = false;

    this.syncService.sync(isFirstSync);
  }

  cancelSync() {
    this.syncService.cancelSync();
  }

  goBack() {
    this.router.navigateByUrl('/main');
  }

}
