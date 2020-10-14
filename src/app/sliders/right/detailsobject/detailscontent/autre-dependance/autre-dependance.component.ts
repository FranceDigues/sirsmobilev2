import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'object-details-content-autre-dependance',
  templateUrl: './autre-dependance.component.html',
  styleUrls: ['./autre-dependance.component.scss'],
})
export class AutreDependanceComponent implements OnInit {

  @Input() activeTab: 'description' | 'observations' | 'prestations' | 'desordres';

  constructor() { }

  ngOnInit() {}

}
