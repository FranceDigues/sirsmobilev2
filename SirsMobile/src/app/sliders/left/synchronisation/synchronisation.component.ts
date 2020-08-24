import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/database.service';
import { SyncService } from 'src/app/sync.service';

@Component({
  selector: 'left-slide-synchronisation',
  templateUrl: './synchronisation.component.html',
  styleUrls: ['./synchronisation.component.scss'],
})
export class LeftSlideSynchronisationComponent implements OnInit {

  constructor(public syncService: SyncService, private router: Router,
    public dbService: DatabaseService) { }

  ngOnInit() { }

  launch() {
    this.syncService.sync();
  }

  cancelSync() {
    this.syncService.cancelSync();
  }

  goBack() {
    this.router.navigateByUrl('/main');
  }

}
