export interface DatabaseModel {
    name: string;
    url: string;
    userId: string;
    password: string;
    replicated?: boolean;
    lastSync?: number;
    favorites?: Array<FavoritesModel>;
    context?: ContextModel;
}

export interface ContextModel {
    authUser?;
    showText?: string;
    backLayer?: BackLayerModel;
    settings?: {
        geolocation: boolean,
        edition: boolean
    };
    lastLocation?;
    version?;
}

export interface BackLayerModel {
    active?: ListBackLayer;
    list?: Array<ListBackLayer>
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
            layers?: any
        }
    };
}

export interface FavoritesModel {
    visible: boolean;
    title?: string;
    filterValue?: string;
    realPosition?: any;
    featLabels?: boolean;
    selectable?: boolean;
    editable?: boolean;
    color?: Array<any>
}
