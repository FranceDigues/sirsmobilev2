import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppLayersService } from 'src/app/services/app-layers.service';
import { DatabaseService } from 'src/app/services/database.service';
import { AppLayer } from 'src/app/services/layers.service';
import { DatabaseModel } from 'src/app/models/database.model';

@Component({
  selector: 'left-slide-disponible-layers',
  templateUrl: './disponible.component.html',
  styleUrls: ['./disponible.component.scss'],
})
export class LeftSlideDisponibleLayersComponent implements OnInit {


  @Output() readonly slidePathChange = new EventEmitter<any>();

  available = [];

  constructor(private appLayersService: AppLayersService,
              private appLayer: AppLayer, private dbService: DatabaseService,
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
    // return this.appLayersService.getFavorites().map(
    //   (item) => {
    //     return item.title;
    //   }).indexOf(layer.title) !== 1;
  }

  toggleLayer(layer) {
    if (this.isActive(layer)) {
      const index = this.appLayersService.removeFavorite(layer);
      this.appLayer.appLayer.getLayers().removeAt(index);
    } else {
      this.appLayersService.addFavorite(layer);
      this.appLayer.appLayer.getLayers().push(this.appLayer.createAppLayerInstance(layer));
    }
    this.updateFavorites();
  }

  updateFavorites() {
    this.dbService.getCurrentDatabaseHardDisk()
    .then(
      (db: DatabaseModel) => {
        db.favorites = this.appLayersService.getFavorites();
        this.dbService.updateCurrentDatabaseHardDisk(db);
      }
    );
  }

}
