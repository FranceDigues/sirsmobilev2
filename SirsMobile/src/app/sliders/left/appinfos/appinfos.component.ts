import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'left-slide-appinfos',
  templateUrl: './appinfos.component.html',
  styleUrls: ['./appinfos.component.scss'],
})
export class AppinfosLeftSlideComponent implements OnInit {

  versionsObject = { };

  @Output() readonly slidePathChange = new EventEmitter<String>();

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('../../../../assets/versions.json')
    .subscribe(
      (data) => {
        console.log('data', data);
        this.versionsObject = data;
      },
      (err) => {
        console.log('err', err);
      }
    )
  }

  goBack() {
    this.slidePathChange.emit('menu');
  }

}
