import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SelectedObjectsService {

    constructor() { }

    featuresEvent = new BehaviorSubject([]);

    getFeatures() {
        return this.featuresEvent;
    }

}
