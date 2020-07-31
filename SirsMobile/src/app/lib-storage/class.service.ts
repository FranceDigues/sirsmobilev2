import { Injectable } from '@angular/core';
import { StorageModel } from './interface.model';

@Injectable({
    providedIn: 'root'
})
export abstract class ClassStorageService implements StorageModel {

    constructor() { }

    abstract setItem(key: string, item: string | object): void;

    abstract getItem(key: string): string | object;

    abstract removeItem(key: string): void;
}
