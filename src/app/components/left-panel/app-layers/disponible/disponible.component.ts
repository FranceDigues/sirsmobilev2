import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppLayersService } from 'src/app/services/app-layers.service';
import { DatabaseService } from 'src/app/services/database.service';
import { MapManagerService } from 'src/app/services/map-manager.service';
import { DatabaseModel } from 'src/app/components/database-connection/models/database.model';

@Component({
  selector: 'left-slide-disponible-layers',
  templateUrl: './disponible.component.html',
  styleUrls: ['./disponible.component.scss'],
})
export class LeftSlideDisponibleLayersComponent implements OnInit {


  @Output() readonly slidePathChange = new EventEmitter<any>();

  available = [];

  constructor(private appLayersService: AppLayersService,
              private mapManagerService: MapManagerService, private dbService: DatabaseService,
              private loadingCtrl: LoadingController) {
                this.loadingCtrl.create({ message: 'Chargement' })
                .then(
                  (loading) => {
                    loading.present();
                    this.appLayersService.getAvailable()
                    .then(
                      (layers) => {
                        this.available = this.order(layers);
                        loading.dismiss();
                      }
                    );
                  }
                );
              }

  private order(value: any) {
    const data = value.sort(this.sortOn());
    return data;
  }

  private sortOn() {
    return (a, b) => {
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      } else if (a.title.toLowerCase() > b.title.toLowerCase()){
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

  toggleLayer(layer) {
    if (this.isActive(layer)) {
      const index = this.appLayersService.removeFavorite(layer);
      if (this.mapManagerService.appLayer) {
        try {
          this.mapManagerService.appLayer.getLayers().removeAt(index);
        } catch {
          // No layer at index.
          console.warn("No layer at index : ", index);
        }
      }
    } else {
      this.appLayersService.addFavorite(layer);
      if (this.mapManagerService.appLayer) {
        const appLayerInstance = this.mapManagerService.createAppLayerInstance(layer);
        appLayerInstance
          .then(layer => {
            this.mapManagerService.appLayer.getLayers().getArray().push(layer);
          })
          .catch(error => {
            console.warn(layer, " : Could not be added to the appLayer array.");
          })
      }
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
