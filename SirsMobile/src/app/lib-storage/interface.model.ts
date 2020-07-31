export interface StorageModel {

    setItem: (key: string, item: string | object) => void;

    getItem: (key: string) => string | object;

    removeItem: (key: string) => void;
}
