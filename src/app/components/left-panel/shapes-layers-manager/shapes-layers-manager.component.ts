// @ts-nocheck

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ShapesLayersManagerService } from 'src/app/services/shapes-layers-manager.service';

import VectorLayer from 'ol/layer/Vector';

@Component({
  selector: 'app-shapes-layers-manager',
  templateUrl: './shapes-layers-manager.component.html',
  styleUrls: ['./shapes-layers-manager.component.scss'],
})
export class ShapesLayersManagerComponent implements OnInit {
  @Output() readonly slidePathChange = new EventEmitter<string>();

  constructor(
    public shapesLayersManagerService: ShapesLayersManagerService
  ) { }

  ngOnInit() {}

  removeLayer(layer, index: number) {
    this.shapesLayersManagerService.removeLayerFromMap(layer, index);
  }

  retrieveLayerName(vectorLayer: VectorLayer<any>) {
    return vectorLayer.getProperties().name ? vectorLayer.getProperties().name : "error: no name found.";
  }

  toggleVisibility(layer, index) {
    layer.getProperties().visible ? layer.setVisible(false) : layer.setVisible(true);
    this.shapesLayersManagerService.updateVisibility(layer.getProperties().visible, index);
  }

  getClassIcon(condition) {
    if (condition) {
      return 'icon-layer-selected';
    } else {
      return 'icon-layer-unselected';
    }
  }


  goToAddBackLayer() {
    this.slidePathChange.emit('addShapeLayer');
  }

  goBack() {
    this.slidePathChange.emit('menu');
  }

}
