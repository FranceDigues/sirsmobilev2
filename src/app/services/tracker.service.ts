import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
    providedIn: 'root'
})
export class TrackerService {
    public status = 'off';
    public coordinates;
    private geolocationWatch;
    public subject = new Subject<any>();

    constructor(private geolocation: Geolocation) {
    }

    start() {
        this.coordinates = [];

        // Switch internal status.
        this.status = 'on';
        this.geolocationWatch = this.geolocation.watchPosition()
            .subscribe((data: any) => {
                this.coordinates.push([
                    data.coords.longitude,
                    data.coords.latitude
                ]);

                // Notify advancement.
                this.subject.next(this.coordinates);
            });

        // Create and return coordinate promise.
        return this.subject;
    }


    stop() {
        // Switch internal status.
        this.status = 'off';
        this.geolocationWatch.unsubscribe();
        // Resolve coordinate.
        this.subject.complete();
        // Return coordinates array.
        return this.coordinates;
    }

    getStatus() {
        return status;
    }

    getCoordinates() {
        return this.coordinates;
    }

    getSubject() {
        return this.subject;
    }
}
