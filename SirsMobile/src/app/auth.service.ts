import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import MD5 from 'crypto-js/md5';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = null; // TODO set type interface

  constructor(private dbService: DatabaseService) { }

  logout() {
    this.user = null;
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
              console.log('NOTE THE TYPE PLS', this.user);
              resolve();
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
