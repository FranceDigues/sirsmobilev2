export interface DatabaseModel {
    name: string;
    url: string;
    userId: string;
    password: string;
    replicated?: boolean;
    lastSync?: number;
    favoritesLayers?: Array<FavoritesLayersModel>;
    favorites?: Array<FavoritesLayersModel>;
    settings?: SettingsModel;
    context?: SettingsModel;
}

export interface SettingsModel {
    authUser?;
    showText?: string;
    defaultObservateurId: string,
    backLayer?: BackLayerModel;
    // mode?: {
    //     enableGeolocation: boolean,
    //     enableEdition: boolean
    // };
    settings?: {
        geolocation: boolean,
        edition: boolean
    };
    currentView?: {
        zoom?: any,
        coords?: any,
    };
}

export interface BackLayerModel {
    active?: ListBackLayer;
    list?: Array<ListBackLayer>;
}

export interface ListBackLayer {
    name: string;
    cache?: {
        active?: any,
        extent?: any,
        url?: any,
        minZoom?: any,
        maxZoom?: any
    };
    source: {
        type: string,
        url: string,
        params?: {
            version?: string,
            layers?: any;
        },
    };
}

export interface FavoritesLayersModel {
    visible: boolean;
    title?: string;
    filterValue?: string;
    realPosition?: any;
    featLabels?: boolean;
    selectable?: boolean;
    editable?: boolean;
    color?: Array<any>;
}
