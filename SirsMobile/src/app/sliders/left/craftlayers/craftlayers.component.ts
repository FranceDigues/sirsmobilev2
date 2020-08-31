import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppLayersService } from 'src/app/applayers.service';
import { AppLayer } from 'src/app/layers.service';
import { colorFactory } from 'src/app/color-factory';
import { ModalController, NavController } from '@ionic/angular';
import { ModalComponent } from './modal/modal.component';

@Component({
  selector: 'left-slide-craftlayers',
  templateUrl: './craftlayers.component.html',
  styleUrls: ['./craftlayers.component.scss'],
})
export class LeftSlideCraftlayersComponent implements OnInit {

    @Output() readonly slidePathChange = new EventEmitter<String>();
    layerTemp = Object.assign([], this.appLayersService.getFavorites());
    layers = this.layerTemp.reverse();
    colors = colorFactory.colors;

    order = false;

    path = 0;

    constructor(private appLayersService: AppLayersService,
                public appLayer: AppLayer, private modalCtrl: ModalController,
                private navCtrl: NavController) { }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    changeSlidePath(event) {
        this.path = event;
        this.layerTemp = Object.assign([], this.appLayersService.getFavorites());
        this.layers = this.layerTemp.reverse();
    }

    getClassIcon(condition) {
        if (condition) {
            return 'icon-layer-selected';
        } else {
            return 'icon-layer-unselected';
        }
    }

    getStyleColor(layer) {
        return {
            'background-color': 'rgb(' + layer.color[0].toString() + ',' + layer.color[1].toString() + ',' + layer.color[2].toString() + ')'
        }
    }

    ngOnInit() {
    }

    onRenderItems(event) {
        if (event.detail.to == this.layers.length) {
            event.detail.to -= 1;
        }
        this.move(event.detail.from, event.detail.to);
        event.detail.complete();
    }

    move(from, to) {
        const tmp = this.layers[from];

        this.layers[from] = this.layers[to];
        this.layers[to] = tmp;
        this.appLayer.moveAppLayer((this.layers.length - (from + 1)), (this.layers.length - (to + 1)));
        this.clearAll();
        const tmpLayersAfterSort = Object.assign([], this.layers);
        this.appLayersService.setFavorites(tmpLayersAfterSort.reverse());
    }

    clearAll() {
        this.appLayer.clearAll();
    }

    toggleVisibility(layer) {
        layer.visible = !layer.visible;
        this.appLayer.syncAppLayer(layer);
    }

    togglePosition(layer) {
        layer.realPosition = !layer.realPosition;
        this.appLayer.syncAppLayer(layer);
    }

    goToLayerList() {
        this.path = 1;
    }

    featureLabels(layer) {
        setTimeout(() => {
            this.appLayer.addLabelFeatureLayer(layer);
        }, 1000);
    }

    async openModal(layer) {
        const modal = await this.modalCtrl.create({
            component: ModalComponent,
            animated: true,
            cssClass: 'modal-css',
            componentProps: { layer: layer }
        });
        modal.onDidDismiss()
        .then(
            (color) => {
                if (color.data) {
                    console.log('color ::', color.data);
                    layer.color = color.data;
                    setTimeout(() => {
                        // this.appLayer.reloadLayer(layer): // TODO verify you can reactive this
                    }, 1000);
                }
            }
        )
        return await modal.present();
    }

    // $ionicModal.fromTemplateUrl('color-modal.html', {
    //         scope: $scope,
    //         animation: 'slide-in-up',
    //         backdropClickToClose: false
    //     }).then(function (modal) {
    //         self.colorModal = modal;
    //     });

    onBack() {
        this.slidePathChange.emit('menu');
    }



}
