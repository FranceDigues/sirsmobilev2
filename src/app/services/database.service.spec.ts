import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { DatabaseService } from './database.service';
import { DatabaseModel } from '../components/database-connection/models/database.model';

describe('Testing Database Service', () => {
    let databaseService: DatabaseService;
    let nativeStorage: NativeStorage;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
          imports: [],
          providers: [NativeStorage, DatabaseService]
        }).compileComponents();
    }));

    beforeEach(() => {
        databaseService = TestBed.inject(DatabaseService);
        nativeStorage = TestBed.inject(NativeStorage);
    });

    it('setActiveDB method should set the activeDB variable equal to the parameter', () => {
        const res: DatabaseModel = {
            name: 'test',
            url: 'test',
            userId: 'test',
            password: '',
        };

        databaseService.setActiveDB(null);
        expect(databaseService.activeDB).toBeNull();
        databaseService.setActiveDB(res);
        expect(databaseService.activeDB).toEqual(res);
    })

    it('saveDatabaseSettings method should update databases in hardDisk', () => {
        let databases = [
            {
                name: 'test',
                url: 'test',
                userId: 'test',
                password: '',
            },
            {
                name: 'test',
                url: 'test',
                userId: 'test',
                password: '',
            }
        ];

        spyOn(nativeStorage, 'setItem');

        databaseService.saveDatabaseSettings(databases);
        expect(nativeStorage.setItem).toHaveBeenCalledWith('databases-settings', databases);
    });

    it('getDatabaseSettings method should return databases from hardDisk', () => {
        spyOn(nativeStorage, 'getItem');

        databaseService.getDatabaseSettings();
        expect(nativeStorage.getItem).toHaveBeenCalledWith('databases-settings');
    });

    it('getCurrentDatabaseSettings method should return current database', () => {
        const db1 = {
            name: 'test1',
            url: 'test1',
            userId: 'test1',
            password: '',
        };
        const db2 = {
            name: 'test2',
            url: 'test2',
            userId: 'test2',
            password: '',
        };
        let databases = [
            db1,
            db2
        ];

        databaseService.setActiveDB(db1);
        spyOn(nativeStorage, 'getItem').and.returnValue(Promise.resolve(databases))

        databaseService.getCurrentDatabaseSettings()
        .then(
            (res) => {
                expect(res).toEqual(db1);
            }
        )
        expect(nativeStorage.getItem).toHaveBeenCalledWith('databases-settings');
    });

    it('getCurrentDatabaseSettings method should return null because error', () => {
        const db1 = {
            name: 'test1',
            url: 'test1',
            userId: 'test1',
            password: '',
        };
        const db2 = {
            name: 'test2',
            url: 'test2',
            userId: 'test2',
            password: '',
        };
        const fakeDB = {
            name: 'test3',
            url: 'test3',
            userId: 'test3',
            password: '',
        }
        let databases = [
            db1,
            db2
        ];

        databaseService.setActiveDB(fakeDB);
        spyOn(nativeStorage, 'getItem').and.returnValue(Promise.resolve(databases))

        databaseService.getCurrentDatabaseSettings()
        .then(
            (res) => {
                expect(res).toBeNull();
            }

        );
        expect(nativeStorage.getItem).toHaveBeenCalledWith('databases-settings');
    });

    it('setCurrentDatabaseSettings method should update the targetted db in HardDisk', (done) => {
        const db1 = {
            name: 'test1',
            url: 'test1',
            userId: 'test1',
            password: '',
        };
        const db1Updated = {
            name: 'test1Updated',
            url: 'test1Updated',
            userId: 'test1Updated',
            password: '',
        };
        const db2 = {
            name: 'test2',
            url: 'test2',
            userId: 'test2',
            password: '',
        };
        let databases = [
            db1,
            db2
        ];

        databaseService.setActiveDB(db1);
        spyOn(nativeStorage, 'getItem').and.returnValue(Promise.resolve(databases))
        spyOn(databaseService, 'saveDatabaseSettings');

        databaseService.setCurrentDatabaseSettings(db1Updated);
        setTimeout(() => {
            expect(nativeStorage.getItem).toHaveBeenCalledWith('databases-settings');
            expect(databaseService.saveDatabaseSettings).toHaveBeenCalledWith([db1Updated, db2]);
            done();
        }, 20);
    });

    it('changeDatabase method should set remoteDB & localDB & activeDB to null', () => {
        databaseService.remoteDB = '';
        databaseService.localDB = '';
        databaseService.activeDB = {
            name: 'test',
            url: 'test',
            userId: 'test',
            password: '',
        };

        databaseService.changeDatabase();
        expect(databaseService.remoteDB).toBeNull();
        expect(databaseService.localDB).toBeNull();
        expect(databaseService.activeDB).toBeNull();
    });
});
