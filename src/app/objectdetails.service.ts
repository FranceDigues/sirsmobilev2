import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ObjectDetails {

    // Paths

    photoDir = null;
    notesDir = null;
    docDic = null;

    // Selections

    selectedFeatures = [];
    selectedObject = null;
    selectedObservation = null;

}
