import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from '../components/database-connection/models/database.model';
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    remoteDB = null;
    localDB = null;
    activeDB: DatabaseModel;
    removeDB$ = new Subject();

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
                console.error('Unexpected behavior: active database is null');
            }
            this.localDB = new PouchDB(this.activeDB.name, {
                location: 'default',
                androidDatabaseProvider: 'system',
                adapter: 'cordova-sqlite'
            });
            /* Indicate there is no memory leak in the Fourth Step (10 listeners by default).
             TODO : Try to rise this limit until I have memory leaks warning. Check : https://pouchdb.com/errors.html
             */
            this.localDB.setMaxListeners(15);
        }
        return this.localDB;
    }

    saveDatabaseSettings(databases) {
        this.nativeStorage.setItem('databases-settings', databases);
    }

    updateActiveDatabaseSettings() {
        this.nativeStorage.getItem('databases-settings')
            .then((databases) => {
                    databases.forEach((database, i) => {
                        if (database.name === this.activeDB.name) {
                            databases[i] = this.activeDB;
                            this.nativeStorage.setItem('databases-settings', databases);
                        }
                    });
                },
                (err) => {
                    console.error(err);
                });
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
                    }, error => {
                        console.error('error getting databases-setting : ', error);
                    }
                )
                .catch(error => {
                    console.error('error getting databases-setting : ', error);
                });
        });
    }

    setCurrentDatabaseSettings(updatedDatabase) {
        return (this.getDatabaseSettings()
            .then(
                (databases) => {
                    databases.forEach((database, i) => {
                        if (database.name === this.activeDB.name) {
                            databases[i] = updatedDatabase;
                            this.saveDatabaseSettings(databases);
                            // Update activeDB object with the updated data
                            this.activeDB = databases[i];
                        }
                    });
                }
            ));
    }

    changeDatabase() {
        this.remoteDB = this.localDB = this.activeDB = null;
    }

    changeShowTextConfig(value: string) {
        this.getCurrentDatabaseSettings()
            .then(
                (database: DatabaseModel) => {
                    database.context.showText = value;
                    this.setCurrentDatabaseSettings(database).then();
                },
            );
    }

    changeDefaultObservateurId(value: string) {
        this.getCurrentDatabaseSettings()
            .then(
                (database: DatabaseModel) => {
                    database.context.defaultObservateurId = value;
                    this.setCurrentDatabaseSettings(database).then();
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

    changeFavoritesLayers(favorites) {
        this.getCurrentDatabaseSettings()
            .then(
                (database: DatabaseModel) => {
                    database.favorites = favorites;
                    this.setCurrentDatabaseSettings(database);
                },
            );
    }
}
