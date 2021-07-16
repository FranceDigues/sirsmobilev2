import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from '../components/database-connection/models/database.model';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {

    remoteDB = null;
    localDB = null;
    activeDB: DatabaseModel;

    constructor(private nativeStorage: NativeStorage) {
    }

    setActiveDB(activeDB) {
        this.activeDB = activeDB;
    }

    async getRemoteDB() {
        if (this.remoteDB === null) {
            if (this.activeDB === null) {
                console.error('ERROR');
                return null;
            }
            this.remoteDB = new PouchDB(this.activeDB.url,
                {
                    auth: {
                        username: this.activeDB.userId,
                        password: this.activeDB.password
                    }
                });
        }
        return (this.remoteDB);
    }

    getLocalDB() {
        if (this.localDB == null) {
            if (this.activeDB == null) {
                console.error('ERROR');
            }
            this.localDB = new PouchDB(this.activeDB.name, {
                iosDatabaseLocation: 'Library',
                androidDatabaseImplementation: 2,
                adapter: 'cordova-sqlite'
            });
            // Indicate there is not memory leak in the Fourth Step (10 listeners by default)
            this.localDB.setMaxListeners(15); // TODO : Try to rise this limit until I have memory leaks warning. Check : https://pouchdb.com/errors.html
        }
        return this.localDB;
    }

    saveDatabaseSettings(databases) {
        this.nativeStorage.setItem('databases-settings', databases);
    }

    getDatabaseSettings() {
        return this.nativeStorage.getItem('databases-settings');
    }

    getCurrentDatabaseSettings() {
        return new Promise((resolve, reject) => {
            this.nativeStorage.getItem('databases-settings')
                .then(
                    (databases) => {
                        const currentDB = databases.find(item => item.name === this.activeDB.name);
                        if (currentDB) {
                            resolve(currentDB);
                        } else {
                            reject('Error, cannot find current db settings');
                        }
                    },error => {
                        console.error("error getting databaeses-setting : ", error);
                    }
                )
                .catch(error => {
                    console.error("error getting databaeses-setting : ", error);
                })
        });
    }

    setCurrentDatabaseSettings(updatedDatabase) {
        this.getDatabaseSettings()
            .then(
                (databases) => {
                    databases.forEach((database, i) => {
                        if (database.name === this.activeDB.name) {
                            databases[i] = updatedDatabase;
                            this.saveDatabaseSettings(databases);
                        }
                    });
                }
            );
    }

    changeDatabase() {
        this.remoteDB = this.localDB = this.activeDB = null;
    }

    changeShowTextConfig(value: string) {
        this.getCurrentDatabaseSettings()
            .then(
                (database: DatabaseModel) => {
                    database.context.showText = value;
                    this.setCurrentDatabaseSettings(database);
                },
            );
    }

    changeEditionModeFlag(flag: boolean) {
        this.getCurrentDatabaseSettings()
            .then(
                (database: DatabaseModel) => {
                    database.context.settings.edition = flag;
                    this.setCurrentDatabaseSettings(database);
                },
            );
    }

    changeGeolocationFlag(flag: boolean) {
        this.getCurrentDatabaseSettings()
            .then(
                (database: DatabaseModel) => {
                    database.context.settings.geolocation = flag;
                    this.setCurrentDatabaseSettings(database);
                },
            );
    }
}
