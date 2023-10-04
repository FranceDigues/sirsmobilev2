import { Component, EventEmitter, Output } from '@angular/core';
import { OLService } from "@ionic-lib/lib-map/ol.service";

@Component({
    selector: 'app-settings2',
    templateUrl: './app-settings2.component.html',
    styleUrls: ['./app-settings2.component.scss'],
})
export class AppSettings2Component {
    @Output() readonly slidePathChange = new EventEmitter<string>();

    get touchSensitivity() {
        return +localStorage.getItem('touchSensitivity') || 200;
    }

    set touchSensitivity(value: number) {
        localStorage.setItem('touchSensitivity', value.toString());
    }

    get moveTolerance() {
        return +localStorage.getItem('moveTolerance') || 8;
    }

    set moveTolerance(value: number) {
        localStorage.setItem('moveTolerance', value.toString());
        this.olService.getMap()['moveTolerance_'] = value;
        // Hack to change map moveTolerance_ option and redraw map
        this.olService.getMap().updateSize();
        this.olService.getMap().setTarget();
        this.olService.getMap().setTarget('map');
    }

    constructor(private olService: OLService) {
    }

    ngOnInit() {

    }

    goBack() {
        this.slidePathChange.emit('menu');
    }

}
