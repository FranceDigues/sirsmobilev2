export function Random(): number {
    const crypto = window.crypto;
    let array = new Uint32Array(1);

    crypto.getRandomValues(array);
    return array[0] * Math.pow(2,-32);
}

export class UuidUtils {

    constructor() { }

    static generateUuid() {
        function s4() {
        return Math.floor((1 + Random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
}
