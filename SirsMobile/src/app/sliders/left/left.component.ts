import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'left-slide',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.scss'],
})
export class LeftSlideComponent implements OnInit {

  slidePath = 'menu';

  constructor() { }

  ngOnInit() {}

  changeSlidePath(path: string) {
    this.slidePath = path;
    console.log('slide : ', this.slidePath);
  }

}
