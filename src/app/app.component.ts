import { Component, OnInit } from '@angular/core';

import { Toast } from '@ionic-native/toast/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private toast: Toast) { }

  ngOnInit() {
    // TODO Show toast if network connection is lost
  }
}
