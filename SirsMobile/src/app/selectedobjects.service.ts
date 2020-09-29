import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SelectedObjectsService {

    constructor() { }

    featuresEvent = new BehaviorSubject([]);

    getFeatures() {
        return this.featuresEvent;
    }

    updateFeatures(features) {
        this.featuresEvent.next(features);
    }

}
