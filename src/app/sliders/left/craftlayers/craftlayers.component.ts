import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppLayersService } from 'src/app/services/app-layers.service';
import { AppLayer } from 'src/app/services/layers.service';
import { colorFactory } from 'src/app/utils/color-factory';
import { ModalController, NavController } from '@ionic/angular';
import { ColorModalComponent } from './color-modal/color-modal.component';
import { DatabaseService } from '../../../services/database.service';
import { DatabaseModel } from '../../../models/database.model';

@Component({
  selector: 'left-slide-craftlayers',
  templateUrl: './craftlayers.component.html',
  styleUrls: ['./craftlayers.component.scss'],
})
export class LeftSlideCraftlayersComponent implements OnInit {

    @Output() readonly slidePathChange = new EventEmitter<string>();
    layers = Object.assign([], this.appLayersService.getFavorites());
    colors = colorFactory.colors;

    order = false;

    path = 0;

    constructor(private appLayersService: AppLayersService,
                public appLayer: AppLayer, private modalCtrl: ModalController,
                private navCtrl: NavController, private dbService: DatabaseService) { }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    changeSlidePath(event) {
        this.path = event;
        this.layers = Object.assign([], this.appLayersService.getFavorites());
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
        };
    }

    ngOnInit() {
    }

    updateFavorites() {
        this.appLayersService.favorites = Object.assign([], this.layers);
        this.dbService.getCurrentDatabaseHardDisk()
        .then(
            (db: DatabaseModel) => {
                db.favorites = this.appLayersService.favorites;
                this.dbService.updateCurrentDatabaseHardDisk(db);
            }
        );
    }

    onRenderItems(event) {
        const draggedItem = this.layers.splice(event.detail.from, 1)[0];
        this.layers.splice(event.detail.to, 0, draggedItem);
        this.move(event.detail.from, event.detail.to);
        event.detail.complete();
        this.updateFavorites();
    }

    move(from, to) {
        this.appLayer.moveAppLayer((this.layers.length - (from + 1)), (this.layers.length - (to + 1)));
        this.clearAll();
        const tmpLayersAfterSort = Object.assign([], this.layers);
        this.appLayersService.setFavorites(tmpLayersAfterSort);
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
        this.appLayer.addLabelFeatureLayer(layer);
    }

    async openModal(layer) {
        const modal = await this.modalCtrl.create({
            component: ColorModalComponent,
            animated: true,
            cssClass: 'modal-css',
            componentProps: { layer }
        });
        modal.onDidDismiss()
        .then(
            (color) => {
                if (color.data) {
                    layer.color = color.data;
                    setTimeout(() => {
                        // this.appLayer.reloadLayer(layer): // TODO verify you can reactive this
                    }, 1000);
                }
            }
        );
        return await modal.present();
    }

    onBack() {
        this.slidePathChange.emit('menu');
    }



}
