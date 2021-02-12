import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { AppLayer, EditionLayer } from 'src/app/services/layers.service';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'left-slide-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class LeftSlideMenuComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();

  constructor(public editionLayer: EditionLayer, public geoloc: GeolocationService,
              public mapService: MapService, private appLayer: AppLayer, private route: Router) { }

  ngOnInit() {}

  goCraftLayers() {
    this.slidePathChange.emit('craftLayers');
  }

  goChoiceOfSectionsDigues() {
    this.slidePathChange.emit('choiceOfSectionsDigues');
  }

  goBackMap() {
    this.slidePathChange.emit('backMap');
  }

  goGallery() {
    this.route.navigateByUrl('/gallery');
  }

  goSynchronisation() {
    this.route.navigateByUrl('/sync');
  }

  changeEditionMode() {
    const tmp = this.editionLayer.editionLayer.getVisible();
    this.editionLayer.editionLayer.setVisible(!tmp);
  }

  changeLocationGPS() {
    this.geoloc.enableGeoloc = !this.geoloc.enableGeoloc;
  }

  changeShowArchivedObjects() {
    this.mapService.archiveObjectsFlag = !this.mapService.archiveObjectsFlag;
    this.appLayer.syncAllAppLayer();
  }

  goAppInfos() {
    this.slidePathChange.emit('appInfos');
  }

  goAppSettings() {
    this.slidePathChange.emit('appSettings');
  }

}
