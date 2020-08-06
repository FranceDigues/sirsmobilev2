export interface StorageModel {

    setItem: (key: string, item: object) => void;

    getItem: (key: string) => object;

    removeItem: (key: string) => void;
}
