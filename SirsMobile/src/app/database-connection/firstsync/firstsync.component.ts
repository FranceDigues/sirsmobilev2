import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../database.service';
import { SyncService } from '../../sync.service';

@Component({
  selector: 'app-firstsync',
  templateUrl: './firstsync.component.html',
  styleUrls: ['./firstsync.component.scss'],
})
export class FirstsyncComponent implements OnInit {

  constructor(public syncService: SyncService,
    public dbService: DatabaseService) { }

  ngOnInit() {
    this.syncService.sync();
  }

}
