import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from './models/database.model';
// import * as PouchDB from 'pouchdb/dist/pouchdb';
// import * as cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  remoteDB = null;
  localDB = null;

  constructor(private nativeStorage: NativeStorage) { }

  async getRemoteDB(activeDB: DatabaseModel) {
    if (this.remoteDB == null) {
      console.log("On rentre dans la fonction getRemoteDB");
      this.remoteDB = new PouchDB(activeDB.url,
        {
          auth: {
            username: activeDB.user_id,
            password: activeDB.password
          }
        });
    }
    return (this.remoteDB)
  }

  getLocalDB(activeDB: DatabaseModel) {
    if (this.localDB == null) {
      console.log("On RENTRE dans la fonction getLocalDB");
      this.localDB = new PouchDB(activeDB.name,
        {
          iosDatabaseLocation: 'Library',
          androidDatabaseImplementation: 2
        });
      this.localDB.setMaxListeners(15); // Indicate there is not memory leak in the Fourth Step (10 listeners by default)
    }
    return (this.localDB);
  }

  updateDatabasesHardDisk(databases) {
    this.nativeStorage.setItem('databases', databases);
  }

  getDatabasesHardDisk() {
    return this.nativeStorage.getItem('databases');
  }

  changeDatabase() {
    this.remoteDB = this.localDB = null;
  }
}
