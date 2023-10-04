import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import MD5 from 'crypto-js/md5';
import { DatabaseModel } from '../components/database-connection/models/database.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = null;

  constructor(private dbService: DatabaseService, private route: Router) { }

  isAuth() {
    return new Promise((resolve, reject) => {
      this.dbService.getCurrentDatabaseSettings()
      .then(
        (database: DatabaseModel) => {
          if (database.context.authUser !== null) {
            this.user = database.context.authUser;
            resolve(true);
          } else {
            resolve(false);
          }
        }
      )
      .catch(error => {
        console.error('getCurrentDatabaseSettings error : ', error);
        reject(error);
      });
    });
  }

  getValue() {
    return this.dbService.activeDB.context.authUser;
  }

  logout() {
    this.user = null;
    this.dbService.getCurrentDatabaseSettings()
      .then(
        (database: DatabaseModel) => {
          database.context.authUser = null;
          this.dbService.removeDB$.next("DB changed");
          this.dbService.setCurrentDatabaseSettings(database)
            .then(() => this.route.navigateByUrl('/'));
        }
      );
  }

  login(login, password) {
    const options = { key: login, include_docs: true };
    return new Promise((resolve, reject) => {
      this.dbService.getLocalDB().query('Utilisateur/byLogin', options)
      .then((result) => {
          if (result.rows.length >= 1) {
            const hash = MD5(password);
            let found = false;
            for (const row of result.rows) {
              if (row.doc.password === hash.toString().toUpperCase()) {
                found = true;
                this.user = row.doc;
                this.dbService.getCurrentDatabaseSettings()
                  .then((database: DatabaseModel) => {
                    database.context.authUser = this.user;
                    this.dbService.activeDB = database;
                    this.dbService.setCurrentDatabaseSettings(database);
                    resolve(database);
                  },
                  (error) => {
                    console.error(error);
                    reject();
                  }
                );
              }
            }
            if (!found) {
              console.error('error');
              reject();
            }
          } else {
            reject();
          }
        },
        (error) => {
          console.error(error);
          reject();
        }
      );
    });
  }
}
