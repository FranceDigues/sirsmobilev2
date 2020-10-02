#!/usr/bin/env node

const keyWords = [
    'cordova',
    'pouchdb',
    'proj4',
    'plugin'
];

const fs = require('fs');

fs.readFile('package.json', (errorRead, data) =>  {
    if (errorRead) {
        console.log("\x1b[31mError\nCan not find package.json.\n\x1b[0m");
        exit(84);
    } else {
        console.log("\x1b[32mUpdating src/versions.json\x1b[0m")
        const jsonData = JSON.parse(data);
        const res = selectDependencies(jsonData.dependencies)
        let androidDataObject = JSON.stringify(res, null, 2);
        let iosDataObject = JSON.stringify(handleIOS(res), null, 2);
        fs.writeFile('src/assets/android-versions.json', androidDataObject + '\n', (errWrite) => {
            if (errWrite) return console.log("\x1b[31m" + err + "\x1b[0m");
        });
        fs.writeFile('src/assets/ios-versions.json', iosDataObject + '\n', (errWrite) => {
            if (errWrite) return console.log("\x1b[31m" + err + "\x1b[0m");
        });
    }
});

function handleIOS(object) {
    for (let tmp in object) {
        if (tmp.includes('android')) {
            delete object[tmp];
        }
    }
    return object;
}

function includesKeyWords(word) {
    for (let i = 0, key = null; i < keyWords.length; i++) {
        key = keyWords[i]
        if (word.includes(key) === true || word == "ol") {
            return true;
        }
    }
    return false;
}

function selectDependencies(dependencies) {
    let res = { };
    for (let tmp in dependencies) {
        if (includesKeyWords(tmp)) {
            let version = dependencies[tmp].replace('^', '');
            res[tmp] = version;
        }
    }
    return res;
}
