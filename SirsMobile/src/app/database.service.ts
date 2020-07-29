import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseModel } from './models/database.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  remoteDB = null;
  localDB = null;
  activeDB: DatabaseModel;

  constructor(private nativeStorage: NativeStorage) { }

  setActiveDB(activeDB) {
    this.activeDB = activeDB;
  }

  async getRemoteDB() {
    if (this.remoteDB == null) {
      if (this.activeDB == null) {
        console.log("ERROR");
      }
      console.log("On rentre dans la fonction getRemoteDB");
      this.remoteDB = new PouchDB(this.activeDB.url,
        {
          auth: {
            username: this.activeDB.user_id,
            password: this.activeDB.password
          }
        });
    }
    return (this.remoteDB)
  }

  getLocalDB() {
    if (this.localDB == null) {
      if (this.activeDB == null) {
        console.log("ERROR");
      }
      console.log("On RENTRE dans la fonction getLocalDB");
      this.localDB = new PouchDB(this.activeDB.name,
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
    this.remoteDB = this.localDB = this.activeDB = null;
  }
}
