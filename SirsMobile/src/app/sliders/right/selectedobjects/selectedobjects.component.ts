import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { SelectedObjectsService } from 'src/app/selectedobjects.service';
import { features } from 'process';

@Component({
  selector: 'right-slide-selected-objects',
  templateUrl: './selectedobjects.component.html',
  styleUrls: ['./selectedobjects.component.scss'],
})
export class SelectedObjectsComponent implements OnInit, OnDestroy {

  features = [];
  featuresCollection = [];
  subscription = null;

  constructor(private selectedObjectService: SelectedObjectsService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.selectedObjectService.getFeatures()
    .subscribe({
      next: (features) => {
      console.log('je suis appelé');
      this.features.length = 0;
      for (let feat of features) {
        this.features.push(feat);
      }
      this.featuresCollection = this.getAllFeaturesFromCluster(features);
      this.cdr.detectChanges();
    }});
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

  }

}
