import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppLayersService } from 'src/app/services/app-layers.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MapManagerService } from 'src/app/services/map-manager.service';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';
import { EditionLayerService } from 'src/app/services/edition-layer.service';

@Component({
  selector: 'left-slide-disponible-layers',
  templateUrl: './disponible.component.html',
  styleUrls: ['./disponible.component.scss'],
})
export class LeftSlideDisponibleLayersComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<any>();

  available = [];

  constructor(private appLayersService: AppLayersService,
              private mapManagerService: MapManagerService, 
              private dbService: DatabaseService,
              private loadingCtrl: LoadingController,
              private editionLayerService: EditionLayerService,
              ) {
                this.loadingCtrl.create({ message: 'Chargement' })
                .then(
                  (loading) => {
                    loading.present();
                    this.appLayersService.getAvailable()
                    .then(
                      (layers) => {
                        //HACK hard to remove old dependance module configuration from desktop
                        const withoutOldDependanceModules = this.oldDependanceFilter(layers);
                        this.available = this.order(withoutOldDependanceModules);
                        loading.dismiss();
                      }
                    );
                  }
                );
              }

  private oldDependanceFilter(layers) {
    return layers.filter(l => !(Array.isArray(l.categories) && l.categories.includes('Dépendances')))
  }

  private order(value: any) {
    const data = value.sort(this.sortOn());
    return data;
  }

  private sortOn() {
    return (a, b) => {
      const lowtitlea = a.title.toLowerCase();
      const lowtitleb = b.title.toLowerCase();

      if (lowtitlea.localeCompare(lowtitleb) < 0) {
        return -1;
      } else if (lowtitlea.localeCompare(lowtitleb) > 0){
        return 1;
      } else {
          return 0;
      }
    };
  }

  ngOnInit() {}

  goBack() {
    this.slidePathChange.emit(0);
  }

  isActive(layer) {
    const favorites = this.appLayersService.getFavorites();

    for (const favorite of favorites) {
      if (favorite.title === layer.title) {
        return true;
      }
    }
    return false;
  }

  async toggleLayer(layerModel) {
    if (this.isActive(layerModel)) {
      const index = this.appLayersService.removeFavorite(layerModel);
      if (!this.mapManagerService.appLayer) {
        await this.mapManagerService.init();
      }
      try {
        this.mapManagerService.appLayer.getLayers().removeAt(index);
      } catch {
        // No layer at index.
        console.warn('No layer at index : ', index);
      }
      this.editionLayerService.updateEditionLayerInstance(this.appLayersService.getFavorites());
    } else {
      this.appLayersService.addFavorite(layerModel);
      if (!this.mapManagerService.appLayer) {
        await this.mapManagerService.init();
      }
      this.mapManagerService.createAppLayerInstance(layerModel)
        .then(layer => {
          this.mapManagerService.appLayer.getLayers().getArray().push(layer);
        })
        .catch(error => {
          console.warn(layerModel, ' : Could not be added to the appLayer array.');
        });
    }
    this.updateFavorites();
  }

  updateFavorites() {
    this.dbService.getCurrentDatabaseSettings()
    .then(
      (db: DatabaseModel) => {
        db.favorites = this.appLayersService.getFavorites();
        this.dbService.setCurrentDatabaseSettings(db);
      }
    );
  }

}
