import { Injectable } from '@angular/core';

interface AppConfiguration {
    router: {
        path: string;
        search: any;
    };

    // Database.
    database: {
        active: string,
        list: any,
        authUser: string;
    };
    // Background layer.
    backLayer: any;

    // Settings.
    mode: {
        enableGeolocation: boolean,
        enableEdition: boolean
    };

    // Others.
    lastLocation: any;
}

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    private configuration: AppConfiguration;
    private defaultConfig = {
        router: {
            path: '/',
            search: {}
        },
        // Database.
        database: {
            active: '',
            list: [],
            // Authentication.
            authUser: null
        },

        // Background layer.
        backLayer: {
            active: 'OpenStreetMap',
            list: [
                {
                    name: 'OpenStreetMap',
                    source: {
                        type: 'OSM',
                        url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                },
                {
                    name: 'Landscape',
                    source: {
                        type: 'OSM',
                        url: 'http://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
                    }
                }
            ]
        },

        // Settings.
        mode: {
            enableGeolocation: true,
            enableEditionMode: false
        },

        // Others.
        lastLocation: null
    };

    constructor() {
        this.configuration = Object.assign({},
            this.defaultConfig,
            JSON.parse(window.localStorage.getItem('sirs-mobile-app-config')));
    }


    get config() {
        return this.configuration;
    }

    set config(value) {
        this.configuration = value;
        this.saveChanges();
    }

    changeEditionModeFlag(flag: boolean) {
        this.configuration.mode.enableEdition = flag;
        this.saveChanges();
    }

    changeGeolocationFlag(flag: boolean) {
        this.configuration.mode.enableGeolocation = flag;
        this.saveChanges();
    }

    saveChanges() {
        window.localStorage.setItem('sirs-mobile-app-config', JSON.stringify(this.configuration));
    }
}
