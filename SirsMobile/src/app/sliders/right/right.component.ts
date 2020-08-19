import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'right-slide',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss'],
})
export class RightSlideComponent implements OnInit {

  slidePath = "menu";

  constructor() { }

  ngOnInit() {}

}
