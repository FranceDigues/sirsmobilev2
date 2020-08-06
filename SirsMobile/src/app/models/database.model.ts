export interface Favorites {
    visible: boolean;
}

export interface DatabaseModel {
    name: string;
    url: string;
    userId: string;
    password: string;
    replicated?: boolean;
    lastSync?: number;
    favorites?: Array<Favorites>;
}
