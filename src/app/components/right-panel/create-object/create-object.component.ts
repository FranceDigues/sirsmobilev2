import { Component, OnInit } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { AppLayersService } from '../../../services/app-layers.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from "@ionic/angular";
import { EditObjectService } from "../../../services/edit-object.service";

@Component({
  selector: 'create-object',
  templateUrl: './create-object.component.html',
  styleUrls: ['./create-object.component.scss'],
})
export class CreateObjectComponent implements OnInit {

  selectedLayer = null;

  constructor(public appLayersService: AppLayersService,
              private authService: AuthService,
              private router: Router,
              private loadingControler: LoadingController,
              private toastCtrl: ToastController,
              private editObjectService: EditObjectService) {
  }

  ngOnInit() {
  }

  selectLayer(layer) {
    this.selectedLayer = layer;
    this.editObjectService.selectedLayer = layer;
    const type = this.getSelectLayerType();
    if (type === 'BorneDigue' || type === 'TronconDigue') {
      this.toastCtrl.create({
        message: 'Vous ne pouvez pas créer ce type d\'objet depuis le mobile.',
        duration: 1500
      }).then(toast => toast.present());
    } else if (this.selectedLayer.title === 'Photos des tronçons') {
      this.toastCtrl.create({
        message: 'Sélectionner un tronçon existant pour créer une photo de tronçon.',
        duration: 1500
      }).then(toast => toast.present());
    }
  }

  addObject() {
    this.loadingControler.create({message: 'Chargement'})
      .then((loading) => {
        loading.present().then();
        const type = this.getSelectLayerType();
        const t = encodeURIComponent(type);
        this.router.navigateByUrl('/object/' + t + '/')
          .then(() => loading.dismiss());
      });
    }

  showAddButtons() {
    if (this.selectedLayer) {
      const type = this.getSelectLayerType();
      const title = this.selectedLayer.title;
      return this.authService.getValue().role !== 'GUEST' && type !== 'BorneDigue' && type !== 'TronconDigue' && title !== 'Photos des tronçons';
    } else {
      return false;
    }
  }

  getSelectLayerType() {
    if (this.selectedLayer) {
      return this.selectedLayer.filterValue.substring(this.selectedLayer.filterValue.lastIndexOf('.') + 1);
    } else {
      return null;
    }
  }
}

interface ConditionModel {
  [key: string]: any;
}
@Pipe({
    name: 'filterPipe'
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], condition: ConditionModel): Array<any> {
      const key = Object.keys(condition)[0].toString();
      const value = condition[key];
      const res = items.filter(
          (item) => {
              if (item[key] === value) {
                  return true;
              } else {
                  return false;
              }
          }
      );
      return res;
    }
}
