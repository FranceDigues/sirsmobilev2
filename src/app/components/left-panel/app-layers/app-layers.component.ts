import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AppLayersService} from 'src/app/services/app-layers.service';
import {MapManagerService} from 'src/app/services/map-manager.service';
import {colorFactory} from 'src/app/utils/color-factory';
import {ModalController, NavController} from '@ionic/angular';
import {ColorModalComponent} from './color-modal/color-modal.component';
import {DatabaseService} from '../../../services/database.service';
import {DatabaseModel} from '../../database-connection/models/database.model';
import {EditionLayerService} from 'src/app/services/edition-layer.service';

@Component({
    selector: 'app-layers',
    templateUrl: './app-layers.component.html',
    styleUrls: ['./app-layers.component.scss'],
})
export class AppLayersComponent implements OnInit {

    @Output() readonly slidePathChange = new EventEmitter<string>();
    layers = Object.assign([], this.appLayersService.getFavorites());
    colors = colorFactory.colors;

    order = false;

    path = 0;

    constructor(private appLayersService: AppLayersService,
                public mapManagerService: MapManagerService,
                private modalCtrl: ModalController,
                private dbService: DatabaseService,
                private editionLayerService: EditionLayerService) {
        this.layers.reverse();
        this.mapManagerService.init().then(() => {
            console.log('App layer initialized');
        });
    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

    changeSlidePath(event) {
        this.path = event;
        this.layers = Object.assign([], this.appLayersService.getFavorites());
        this.layers.reverse();
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
        this.appLayersService.favorites = Object.assign([], this.layers).reverse();
        this.dbService.getCurrentDatabaseSettings().then((db: DatabaseModel) => {
            db.favorites = this.appLayersService.favorites;
            return this.dbService.setCurrentDatabaseSettings(db);
        }).then(() => {
            console.debug('Favorites updated');
        }).catch((e) => {
            console.warn('Favorites update error', e);
        });
    }

    onRenderItems(event) {
        //Can happen that event.detail.to reach the maximum size of list
        const to = event.detail.to >= this.layers.length ? this.layers.length - 1 : event.detail.to;
        const draggedItem = this.layers.splice(event.detail.from, 1)[0];
        this.layers.splice(to, 0, draggedItem);
        this.move(event.detail.from, to);
        event.detail.complete();
        this.updateFavorites();
    }

    move(from, to) {
        this.mapManagerService.moveAppLayer(this.layers.length - from - 1, this.layers.length - to - 1);
        this.clearAll();
        const tmpLayersAfterSort = Object.assign([], Object.assign([], this.layers).reverse());
        this.appLayersService.setFavorites(tmpLayersAfterSort);
    }

    clearAll() {
        this.mapManagerService.clearAll();
    }

    toggleVisibility(layer) {
        layer.visible = !layer.visible;
        this.mapManagerService.syncAppLayer(layer);
        this.editionLayerService.updateEditionLayerInstance(this.appLayersService.getFavorites()); // Update Edition layers on map.
    }

    togglePosition(layer) {
        layer.realPosition = !layer.realPosition;
        this.mapManagerService.syncAppLayer(layer);
    }

    goToLayerList() {
        this.path = 1;
    }

    featureLabels(layer) {
        this.mapManagerService.addLabelFeatureLayer(layer);
    }

    async openColorModal(layer) {
        const modal = await this.modalCtrl.create({
            component: ColorModalComponent,
            animated: true,
            cssClass: 'modal-css',
            componentProps: {layer}
        });
        modal.onDidDismiss()
            .then(
                (color) => {
                    if (color.data) {
                        layer.color = color.data;
                        setTimeout(() => {
                            this.mapManagerService.reloadLayer(layer);
                            this.appLayersService.setFavorites(this.appLayersService.favorites);
                        }, 500);
                    }
                }
            );
        return await modal.present();
    }

    onBack() {
        this.slidePathChange.emit('menu');
    }
}
