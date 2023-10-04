import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Feature from 'ol/Feature';

@Injectable({
    providedIn: 'root'
})
export class SelectedObjectsService {

    constructor() { }

    features: Array<Feature> = [];

    featuresEvent = new BehaviorSubject([]);

    getFeatures() {
        return this.featuresEvent;
    }

    updateFeatures(features) {
        this.features = Object.assign([], features);
        this.featuresEvent.next(this.features);
    }

    deleteFeature(id) {
        const newFeatures = this.features.filter(feature => feature.get('id') !== id);
        this.updateFeatures(newFeatures);
    }

}
