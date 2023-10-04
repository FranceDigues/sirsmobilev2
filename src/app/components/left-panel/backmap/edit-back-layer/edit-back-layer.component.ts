// @ts-nocheck

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BackLayerService } from 'src/app/services/back-layer.service';
import TileImage from 'ol/source/TileImage';

@Component({
  selector: 'left-slide-editbacklayer',
  templateUrl: './edit-back-layer.component.html',
  styleUrls: ['./edit-back-layer.component.scss'],
})
export class LeftSlideEditBackLayerComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();

  servicesTypes = [
    {
      label: 'WMS',
      value: 'TileWMS'
    },
    {
      label: 'XYZ',
      value: 'XYZ'
    }
  ];

  backLayerForm = {
    name: null,
    source: {
      type: 'TileWMS',
      url: 'http://',
      params: {
        version: '1.3.0',
        layers: null
      }
    },
    authorization: {
      login: '',
      pw: ''
    }
  };

  constructor(
    private backLayerService: BackLayerService,
  ) { }

  ngOnInit() {
    Object.assign(this.backLayerForm, this.backLayerService.getBackLayerToEdit());
  }

  addBackLayer() {
    if (this.backLayerForm.authorization.login !== '' && this.backLayerForm.authorization.pw !== '') {
      // @ts-ignore
      const tileImage: TileImage = this.backLayerForm.source;
      // @ts-ignore
      tileImage.tileLoadFunction((imageTile, src) => {
          const oReq = new XMLHttpRequest();
          oReq.open('GET', src, true);
          oReq.setRequestHeader('Authorization', 'Basic ' +
          btoa(this.backLayerForm.authorization.login + ':' + this.backLayerForm.authorization.pw));
          oReq.responseType = 'blob';
          oReq.onload = function (oEvent) { // TODO check this (prbly not working)
              const blob = oReq.response;
              const reader = new FileReader();
              reader.onload = function(event) { // TODO check this (prbly not working)
                  imageTile.getImage().src = event.target.result; // event.target.results contains the base64 code to create the image.
              };
              reader.readAsDataURL(blob); // Convert the blob from clipboard to base64
          };

          oReq.send();
      },'');
    }
    this.goBack();
  }

  goBack() {
    this.backLayerService.setActiveBackLayer(this.backLayerForm);
    this.slidePathChange.emit('select');
  }

}
