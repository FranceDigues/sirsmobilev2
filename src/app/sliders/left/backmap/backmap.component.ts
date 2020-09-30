import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BackLayerService } from 'src/app/backlayer.service';
import { BackLayer } from 'src/app/layers.service';

@Component({
  selector: 'left-slide-backmap',
  templateUrl: './backmap.component.html',
  styleUrls: ['./backmap.component.scss'],
})
export class LeftSlideBackmapComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();

  path = 'select';

  constructor(public backLayerService: BackLayerService, private alertCtrl: AlertController,
              private route: Router, public backLayer: BackLayer) { }

  ngOnInit() {}

  changeSlidePath(path: string) {
    this.path = path;
  }

  goBack() {
    this.slidePathChange.emit('menu');
  }

  toggleOnlineMode(layer) {
    layer.cache.active = !layer.cache.active;
    // Update the view
    this.backLayer.setActiveBackLayers(layer);
  }

  goToCache(layer) {
    this.route.navigateByUrl('/cache/' + layer.name);
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
              this.backLayer.setActiveBackLayers(this.backLayerService.getList()[0]);
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

}
