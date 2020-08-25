import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BackLayerService } from 'src/app/backlayer.service';
import TileImage from 'ol/source/TileImage';

@Component({
  selector: 'left-slide-addbacklayer',
  templateUrl: './addbacklayer.component.html',
  styleUrls: ['./addbacklayer.component.scss'],
})
export class LeftSlideAddBackLayerComponent {

  @Output() readonly slidePathChange = new EventEmitter<String>();

  backLayerForm = {
      name: null,
      servicesTypes: [
        {
          label: 'WMS',
          value: 'TileWMS'
        },
        {
          label: 'XYZ',
          value: 'XYZ'
        }
      ],
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

    constructor(public backLayerService: BackLayerService) { }

    goBack() {
      this.slidePathChange.emit('select')
    }

    prepareType() {
        switch(this.backLayerForm.source.type) {
          case 'TileWMS':
            this.backLayerForm.source.params.version = '1.3.0';
            break;
          default:
            this.backLayerForm.source.params = {
              version: null,
              layers: null
            }
        }
    }

    addBackLayer() {
      if (this.backLayerForm.authorization.login !== "" && this.backLayerForm.authorization.pw !== "") {
        let tileImage: TileImage = this.backLayerForm.source;
        tileImage.tileLoadFunction((imageTile, src) => {
            let oReq = new XMLHttpRequest();
            oReq.open("GET", src, true);
            oReq.setRequestHeader("Authorization", 'Basic ' + btoa(this.backLayerForm.authorization.login + ":" + this.backLayerForm.authorization.pw));
            oReq.responseType = "blob";
            oReq.onload = function (oEvent) {
                let blob = oReq.response;
                let reader = new FileReader();
                reader.onload = function (event) {
                    imageTile.getImage().src = event.target.result; //event.target.results contains the base64 code to create the image.
                };
                reader.readAsDataURL(blob);//Convert the blob from clipboard to base64
            };

            oReq.send();
        });
      }
      this.backLayerService.add({type: 'Tile', name: this.backLayerForm.name, source: this.backLayerForm.source});
      this.goBack();
    }

}
