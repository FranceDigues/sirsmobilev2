import { Component, AfterViewInit } from '@angular/core';
import { OLService } from '../../lib/lib-map/ol.service';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

  constructor(private ol: OLService) {}

  ngAfterViewInit() {
    const layer = new TileLayer(
      {
        source: new OSM()
      }
    );

    this.ol.createMap('map'); // Create Map and target the id 'map' to display the OpenLayers Map
    this.ol.addLayer(layer); // Add a layer to this map;
  }
}
