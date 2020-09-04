import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import MD5 from 'crypto-js/md5';
import { DatabaseModel } from './models/database.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = null;

  constructor(private dbService: DatabaseService, private route: Router) { }

  isAuth() {
    this.dbService.getCurrentDatabaseHardDisk()
    .then(
      (database: DatabaseModel) => {
        if (database.context.authUser !== null) {
          this.user = database.context.authUser;
          return true;
        } else {
          return false;
        }
      }
    );
  }

  getValue() {
    return this.dbService.activeDB.context.authUser;
  }

  logout() {
    this.user = null;
    this.dbService.getCurrentDatabaseHardDisk()
    .then(
      (database: DatabaseModel) => {
        database.context.authUser = null;
        this.dbService.updateCurrentDatabaseHardDisk(database);
        this.route.navigateByUrl('/');
      }
    )
  }

  login(login, password) {
    const options = { key: login, include_docs: true };
    return new Promise((resolve, reject) =>
    {
      this.dbService.getLocalDB().query('Utilisateur/byLogin', options)
      .then(
        (result) => {
          console.log(result);
          if (result.rows.length === 1) {
            const hash = MD5(password);
            if (result.rows[0].doc.password === hash.toString().toUpperCase()) {
              this.user = result.rows[0].doc;
              this.dbService.getCurrentDatabaseHardDisk()
              .then(
                (database: DatabaseModel) => {
                  database.context.authUser = this.user;
                  this.dbService.updateCurrentDatabaseHardDisk(database);
                  resolve();
                }
              )
              console.log('NOTE THE TYPE PLS', this.user);
            } else {
              console.log('error');
              reject();
            }
          } else {
            reject();
          }
        },
        (error) => {
          console.log('HERE ???');
          console.log(error);
          reject();
        }
      );
    });
  }
}
