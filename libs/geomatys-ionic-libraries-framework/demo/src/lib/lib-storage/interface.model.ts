export interface StorageModel {

    setItem: (key: string, item: object | Array<any>) => void;

    getItem: (key: string) => object | Array<any>;

    removeItem: (key: string) => void;
}
