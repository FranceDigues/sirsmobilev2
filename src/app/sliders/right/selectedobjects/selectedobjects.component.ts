import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { SelectedObjectsService } from 'src/app/selectedobjects.service';
import { LocalDatabase } from '../../../usingLocalDatabase.service';
import { ObjectDetails } from '../../../objectdetails.service';
import { Toast } from '@ionic-native/toast/ngx';

@Component({
  selector: 'right-slide-selected-objects',
  templateUrl: './selectedobjects.component.html',
  styleUrls: ['./selectedobjects.component.scss'],
})
export class SelectedObjectsComponent implements OnInit, OnDestroy {

  status: 'general' | 'details' = 'general';
  features = [];
  featuresCollection = [];
  subscription = null;

  constructor(private selectedObjectsService: SelectedObjectsService, private cdr: ChangeDetectorRef,
              private localDB: LocalDatabase, private toast: Toast,
              private objectDetails: ObjectDetails) { }

  ngOnInit() {
    this.subscription = this.selectedObjectsService.getFeatures()
    .subscribe((features) => {
      this.status = 'general';
      this.features.length = 0;
      for (let feat of features) {
        this.features.push(feat);
      }
      this.selectedObjectsService.features = this.features;
      this.featuresCollection = this.getAllFeaturesFromCluster(features);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(() => {
      this.features = null;
      this.featuresCollection = null;
    });
  }

  getAllFeaturesFromCluster(features) {
    let res = [];

    features.forEach((feat) => {
      if (Array.isArray(feat.get('features'))) {
        feat.get('features').forEach((f) => {
          res.push(f);
        })
      }
    })
    return res;
  }

  openDetails(feat) {
    feat.set('visited', true);
    this.localDB.get(feat.get('id'))
    .then(
      (doc) => {
        this.openDocumentSuccess(doc);
      },
      (err) => {
        this.toast.showLongTop('Une erreur s\'est produite.').subscribe();
      }
    )
  }

  changeStatus(path: 'general' | 'details') {
    this.status = path;
    this.cdr.detectChanges();
  }

  openDocumentSuccess(doc) {
    this.objectDetails.selectedObject = doc;
    this.status = 'details';
    this.cdr.detectChanges();
  }

}
