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
    backLayer?: {
        active?: string,
        list?: Array<BackLayerModel>
    };
    settings?: {
        geolocation: boolean,
        edition: boolean
    };
    lastLocation?;
    version?;
}

export interface BackLayerModel {
    name: string;
    source: {
        type: string,
        url: string
    }
}

export interface FavoritesModel {
    visible: boolean;
}

