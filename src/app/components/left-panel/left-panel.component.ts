import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit {

  slidePath = 'menu';

  constructor(private route: Router) { }

  ngOnInit() {}

  changeSlidePath(path: string) {
    this.slidePath = path;
  }

  goReset() {
    this.route.navigateByUrl('/');
  }

}
