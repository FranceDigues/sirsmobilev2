import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'observation-details',
  templateUrl: './observation-details.component.html',
  styleUrls: ['./observation-details.component.scss'],
})
export class ObservationDetailsComponent implements OnInit {

  @Output() readonly detailsTypeChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  goBack() {
    this.detailsTypeChange.emit();
  }

}
