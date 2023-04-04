import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StorageService } from '@ionic-lib/lib-storage/storage.service';
import { AppTronconsService, DigueController, SystemeEndiguement, TronconController } from 'src/app/services/troncon.service';
import { Pipe, PipeTransform } from '@angular/core';


@Component({
  selector: 'left-slide-troncon',
  templateUrl: './troncon.component.html',
  styleUrls: ['./troncon.component.scss'],
})
export class LeftSlideTronconComponent implements OnInit {

  @Output() readonly slidePathChange = new EventEmitter<string>();

  view = 'SE';
  SEID = null;
  DID = null;

  constructor(private storageService: StorageService, public systemeEndiguementService: SystemeEndiguement,
              private appTronconsService: AppTronconsService, public digueController: DigueController,
              public tronconCtrl: TronconController) { }

  ngOnInit() {}

  goBack() {
    if (this.view === 'T') {
      this.view = 'D';
      this.digueController.getDigues(this.SEID);
    } else if (this.view === 'D') {
      this.view = 'SE';
      this.tronconCtrl.getTroncons(this.DID);
    } else {
      this.slidePathChange.emit('menu');
    }
  }

  changeView(view) {
    this.view = view;
  }

  putSE(id) {
    if (typeof id !== 'undefined') {
      this.SEID = id;
    }
    this.digueController.digues = [];
    this.digueController.getDigues(this.SEID);
  }

  putD(id) {
    if (typeof id !== 'undefined') {
      this.DID = id;
    }
    this.tronconCtrl.troncons = [];
    this.tronconCtrl.getTroncons(this.DID);
  }

  cleanAll() {
    this.appTronconsService.favorites = [];
    this.storageService.setItem('AppTronconsFavorities', []);
  }

}

@Pipe({
  name: 'sortByLibelleValue'
})
export class ArraySortPipe  implements PipeTransform {

  transform(value: any, exponent: any) {
    const data = value.sort(this.sortOn());
    return data;
  }

  sortOn() {
    return (a, b) => {
      const v1 = a.value ? a.value.libelle : a.libelle;
      const v2 = b.value ? b.value.libelle : b.libelle;
      if (v1.toLowerCase() < v2.toLowerCase()) {
        return -1;
      } else if (v1.toLowerCase() > v2.toLowerCase()){
        return 1;
      } else {
          return 0;
      }
    };
  }
}
