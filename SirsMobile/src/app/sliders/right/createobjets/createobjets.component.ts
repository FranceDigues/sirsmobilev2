import { Component, OnInit } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { AppLayersService } from '../../../applayers.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'right-slide-create-objects',
  templateUrl: './createobjets.component.html',
  styleUrls: ['./createobjets.component.scss'],
})
export class RightSlideCreateObjetsComponent implements OnInit {

  constructor(public appLayersService: AppLayersService, private authService: AuthService) { }

  allLayers = Object.assign([], this.appLayersService.getFavorites());
  selectedLayer = null;

  ngOnInit() {
  }

  selectLayer(layer) {
    this.selectedLayer = layer;
  }

  addObject() {
    this.selectedLayer;
  }

  showAddButtons() {
    if (this.selectedLayer) {
      const type = this.selectedLayer.filterValue.substring(
        this.selectedLayer.filterValue.lastIndexOf('.') + 1
      );
      console.log('show button', this.authService.getValue(), type);
      return (this.authService.getValue().role !== 'GUEST' &&
      type !== 'BorneDigue' && type !== 'TronconDigue');
    } else {
      return false;
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
