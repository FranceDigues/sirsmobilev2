import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'left-slide',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.scss'],
})
export class LeftSlideComponent implements OnInit {

  slidePath = 'menu';

  constructor(private route: Router) { }

  ngOnInit() {}

  changeSlidePath(path: string) {
    this.slidePath = path;
    console.log('slide : ', this.slidePath);
  }

  goReset() {
    this.route.navigateByUrl('/');
  }

}
