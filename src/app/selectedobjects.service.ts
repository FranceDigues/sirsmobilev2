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
        this.featuresEvent.next(features);
    }

}
