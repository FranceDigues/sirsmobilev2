import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OLService } from '@lib-map/ol.service';

@Component({
  selector: 'map-point',
  templateUrl: './map-point.component.html',
  styleUrls: ['./map-point.component.scss'],
})
export class MapPointComponent implements OnInit {

  defaultVisibleValueArrayLayer = [];
  @Output() readonly slidePathChange = new EventEmitter<string>();

  constructor(public olService: OLService) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.olService.map.setTarget('mapPoint');
    let arrayLayer = this.olService.getLayers();
    this.defaultVisibleValueArrayLayer = Object.assign([], arrayLayer);
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(false);
    arrayLayer[2].setVisible(false);
    arrayLayer[3].setVisible(false);
  }

  goBack() {
    let arrayLayer = this.olService.getLayers();
    arrayLayer[0].setVisible(true);
    arrayLayer[1].setVisible(this.defaultVisibleValueArrayLayer[1]);
    arrayLayer[2].setVisible(this.defaultVisibleValueArrayLayer[2]);
    arrayLayer[3].setVisible(this.defaultVisibleValueArrayLayer[2]);
    this.slidePathChange.emit('form');
  }

}
