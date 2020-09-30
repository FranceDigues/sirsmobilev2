import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppVersionsService } from 'src/app/appversions.service';

@Component({
  selector: 'left-slide-appinfos',
  templateUrl: './appinfos.component.html',
  styleUrls: ['./appinfos.component.scss'],
})
export class AppinfosLeftSlideComponent implements OnInit {

  versionsObject = { };

  @Output() readonly slidePathChange = new EventEmitter<string>();

  constructor(private appVersions: AppVersionsService) { }

  ngOnInit() {
    this.versionsObject = this.appVersions.getVersions();
  }

  goBack() {
    this.slidePathChange.emit('menu');
  }

}
