import { Component, OnInit } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { AppLayersService } from '../../../services/app-layers.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'create-object',
  templateUrl: './create-object.component.html',
  styleUrls: ['./create-object.component.scss'],
})
export class CreateObjectComponent implements OnInit {

  selectedLayer = null;

  constructor(public appLayersService: AppLayersService, private authService: AuthService,
              private route: Router) { }

  ngOnInit() {
  }

  selectLayer(layer) {
    this.selectedLayer = layer;
  }

  addObject() {
    const type = this.selectedLayer.filterValue.substring(this.selectedLayer.filterValue.lastIndexOf('.') + 1);
    this.route.navigateByUrl('/object/' + encodeURIComponent(type) + '/');
  }

  showAddButtons() {
    if (this.selectedLayer) {
      const type = this.selectedLayer.filterValue.substring(
        this.selectedLayer.filterValue.lastIndexOf('.') + 1
      );
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
