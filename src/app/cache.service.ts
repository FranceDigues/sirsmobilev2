import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FeatureCache {

    cache = {};

    put(key, item) {
        this.cache[key] = item;
    }

    get(key) {
        return this.cache[key];
    }

    remove(key) {
        delete this.cache[key];
    }

    removeAll() {
        this.cache = {};
    }

    info() {
        const tmp = Object.keys(this.cache);
        return tmp.length;
    }
}
