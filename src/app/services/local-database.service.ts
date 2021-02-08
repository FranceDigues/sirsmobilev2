import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
providedIn: 'root',
})
export class LocalDatabase {

    constructor(private dbService: DatabaseService) { }

    get(id): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().get(id)
            .then(
                (result) => {
                    resolve(result);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }

    queryOne(fun, options): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().query(fun, options)
            .then(
                (result) => {
                    if (result.rows.length === 1) {
                        resolve(result.rows[0]);
                    } else {
                        rejects({ error: 'ERROR' });
                    }
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }

    query(fun, options): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().query(fun, options)
            .then(
                (result) => {
                    resolve(result.rows);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }

    save(doc): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().put(doc)
            .then(
                (result) => {
                    doc._rev = result.rev;
                    resolve(doc);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }

    create(doc): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().post(doc)
            .then(
                (result) => {
                    doc._id = result.id;
                    doc._rev = result.rev;
                    resolve(doc);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }

    remove(doc): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().remove(doc)
            .then(
                (result) => {
                    resolve(result);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }

    getAttachment(docId, attachmentId): Promise<any> {
        return new Promise((resolve, rejects) => {
            this.dbService.getLocalDB().getAttachment(docId, attachmentId)
            .then(
                (result) => {
                    resolve(result);
                },
                (error) => {
                    rejects(error);
                }
            );
        });
    }
}
