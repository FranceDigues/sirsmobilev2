import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'right-slide',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss'],
})
export class RightSlideComponent implements OnInit {

  @Input() slidePath: string;

  constructor() { }

  ngOnInit() {}

}
