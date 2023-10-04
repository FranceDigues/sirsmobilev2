import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BackLayerService } from 'src/app/services/back-layer.service';
import { ListBackLayer } from '../../database-connection/models/database.model';

@Component({
  selector: 'left-slide-backmap',
  templateUrl: './backmap.component.html',
  styleUrls: ['./backmap.component.scss'],
})
export class LeftSlideBackmapComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();

  path = 'select';
  backLayersList: Array<ListBackLayer>;

  constructor(public backLayerService: BackLayerService, private alertCtrl: AlertController,
              private route: Router) { }

  ngOnInit() {
    this.backLayersList = this.backLayerService.getList();
  }

  changeSlidePath(path: string) {
    this.path = path;
  }

  goBack() {
    this.slidePathChange.emit('menu');
  }

  toggleOnlineMode(layer) {
    layer.cache.active = !layer.cache.active;
    // Update the view
    this.backLayerService.setActiveBackLayer(layer);
  }

  goToCache(layer) {
    this.route.navigateByUrl('/cache/' + layer.name);
  }

  goToEdit(layer) {
    this.backLayerService.setBackLayerToEdit(layer);
    this.path = 'editBackLayer';
  }

  async removeLayer(layer) {
    const alert = await this.alertCtrl.create({
      header: 'Suppression d\'une couche',
      message: 'Voulez vous vraiment supprimer cette couche ?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Oui',
          handler: () => {
            const isCurrent = (layer.name === this.backLayerService.getActive().name);
            this.backLayerService.remove(layer);
            if (isCurrent) {
              this.backLayerService.setActiveBackLayer(this.backLayerService.getList()[0]);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  goToAddBackLayer() {
    this.path = 'addBackLayer';
  }

  showingDownloadCloudIcon(layer) {
    return this.backLayerService.getActive()
        && (!layer.cache || !layer.cache.active);
  }

  showingOfflineCloudIcon(layer) {
    return layer.name === this.backLayerService.getActive().name
        && layer.cache && layer.cache.active;
  }

}
