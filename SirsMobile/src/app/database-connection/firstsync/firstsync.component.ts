import { Component, OnInit } from '@angular/core';
import { SyncService } from '../../sync.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-firstsync',
  templateUrl: './firstsync.component.html',
  styleUrls: ['./firstsync.component.scss'],
})
export class FirstsyncComponent implements OnInit {

  constructor(public syncService: SyncService, public router: Router) { }

  ngOnInit() {
    this.syncService.sync()
    .then(
      () => {
        this.router.navigateByUrl('/main');
      }
    );
  }

}
