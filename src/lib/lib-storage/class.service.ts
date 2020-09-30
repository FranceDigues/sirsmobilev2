import { Injectable } from '@angular/core';
import { StorageModel } from './interface.model';

@Injectable({
    providedIn: 'root'
})
export abstract class ClassStorageService implements StorageModel {

    constructor() { }

    abstract setItem(key: string, item: object): void;

    abstract getItem(key: string): object;

    abstract removeItem(key: string): void;
}
