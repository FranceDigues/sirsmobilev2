import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import MD5 from 'crypto-js/md5';
import { DatabaseModel } from '../components/database-connection/models/database.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: any | null = null;

  constructor(private dbService: DatabaseService, private route: Router) { }

  public async isAuth(): Promise<boolean> {
    const database: DatabaseModel = await this.dbService.getCurrentDatabaseSettings();
    if (database.context.authUser !== null) {
      this.user = database.context.authUser;
      return true;
    } else {
      return false;
    }
  }

  getValue() {
    return this.dbService.activeDB.context.authUser;
  }

  public async logout(): Promise<void> {
    this.user = null;
    const db: DatabaseModel = (await this.dbService.getDatabaseSettings())[0];
    db.context.authUser = null;
    this.dbService.removeDB$.next("DB changed");
    await this.dbService.setCurrentDatabaseSettings(db);
    this.route.navigateByUrl('/');
  }

  public async login(login: string, password: string): Promise<DatabaseModel> {
    const result = await this.dbService.getLocalDB().query('Utilisateur/byLogin', {
      key: login,
      include_docs: true
    });

    if (result.rows.length < 1) {
      throw new Error('User not found');
    }

    const hash = MD5(password);

    for (const row of result.rows) {
      if (row.doc.password !== hash.toString().toUpperCase()) continue;
      this.user = row.doc;
      const db = await this.dbService.getCurrentDatabaseSettings();
      db.context.authUser = this.user;
      this.dbService.activeDB = db;
      this.dbService.setCurrentDatabaseSettings(db);
      return db;
    }

    throw Error("Bad password");
  }
}
