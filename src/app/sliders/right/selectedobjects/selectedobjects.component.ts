import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { SelectedObjectsService } from 'src/app/services/selected-objects.service';
import { LocalDatabase } from '../../../services/local-database.service';
import { ObjectDetails } from '../../../services/object-details.service';
import { Toast } from '@ionic-native/toast/ngx';
import Feature from 'ol/Feature';

@Component({
  selector: 'right-slide-selected-objects',
  templateUrl: './selectedobjects.component.html',
  styleUrls: ['./selectedobjects.component.scss'],
})
export class SelectedObjectsComponent implements OnInit, OnDestroy {

  status: 'general' | 'details' = 'general';
  featuresCollection = [];
  subscription = null;

  constructor(private selectedObjectsService: SelectedObjectsService, private cdr: ChangeDetectorRef,
              private localDB: LocalDatabase, private toast: Toast,
              private objectDetails: ObjectDetails) { }


  get features(): Array<Feature> {
    return this.selectedObjectsService.features;
  }

  ngOnInit() {
    this.subscription = this.selectedObjectsService.getFeatures()
    .subscribe((features) => {
      this.status = 'general';
      this.featuresCollection = this.getAllFeaturesFromCluster(features);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(() => {
      this.selectedObjectsService.features = null;
      this.featuresCollection = null;
    });
  }

  getAllFeaturesFromCluster(features) {
    const res = [];

    features.forEach((feat) => {
      if (Array.isArray(feat.get('features'))) {
        feat.get('features').forEach((f) => {
          res.push(f);
        });
      }
    });
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
    );
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
