import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {OLService} from "@ionic-lib/lib-map/ol.service";

@Component({
    selector: 'app-settings2',
    templateUrl: './app-settings2.component.html',
    styleUrls: ['./app-settings2.component.scss'],
})
export class AppSettings2Component implements OnInit {
    @Output() readonly slidePathChange = new EventEmitter<string>();

    get touchSensitivity() {
        return +localStorage.getItem('touchSensitivity') || 200;
    }

    set touchSensitivity(value: number) {
        localStorage.setItem('moveTolerance', value.toString());
    }

    get moveTolerance() {
        return +localStorage.getItem('moveTolerance') || 8;
    }

    set moveTolerance(value: number) {
        localStorage.setItem('moveTolerance', value.toString());
        this.olService.getMap()['moveTolerance_'] = value;
    }

    constructor(private olService: OLService,) {
    }

    ngOnInit() {

    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

}
