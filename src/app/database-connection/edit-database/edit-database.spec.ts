import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { IonicModule } from '@ionic/angular';
import { AppModule } from 'src/app/app.module';
import { DatabaseService } from '../../database.service';
import { EditDatabaseComponent } from './edit-database.component';


describe('Testing EditDatabaseComponent', () => {
    let component: EditDatabaseComponent ;
    let fixture: ComponentFixture<EditDatabaseComponent>;
    let nativeStorage: NativeStorage;
    let formBuilder: FormBuilder;
    let dbService: DatabaseService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ IonicModule.forRoot({
                _testing: true
            }), AppModule, RouterTestingModule ],
        declarations: [ EditDatabaseComponent ],
        providers: [ FormBuilder, NativeStorage, DatabaseService ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditDatabaseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        nativeStorage = TestBed.inject(NativeStorage);
        formBuilder = TestBed.inject(FormBuilder);
        dbService = TestBed.inject(DatabaseService);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit method should get databases and set formBuilder with', (done) => {
        const db1 = {
            name: 'example',
            url: 'geomatys.com',
            userId: 'test',
            password: 'test',
        };
        const databases = [
            db1,
            db1
        ];
        component.databaseIndex = 0;

        spyOn(nativeStorage, 'getItem').and.returnValue(new Promise(resolve => resolve(databases)));
        spyOn(formBuilder, 'control');
        spyOn(formBuilder, 'group');

        component.ngOnInit();

        setTimeout(() => {
            expect(nativeStorage.getItem).toHaveBeenCalledWith('databases');
            expect(component.databases).toEqual(databases);
            expect(formBuilder.control).toHaveBeenCalled();
            expect(formBuilder.group).toHaveBeenCalled();
            done();
        }, 10);
    });

    it('editStorage method should update databases', () => {
        const db1 = {
            name: 'example1',
            url: 'geomatys.com',
            userId: 'test',
            password: 'test',
        };
        const db2 = {
            name: 'example2',
            url: 'geomatys.com',
            userId: 'test',
            password: 'test',
            replicated: false
        };

        spyOn(dbService, 'updateDatabasesHardDisk');

        component.databaseIndex = 0;
        component.databaseForm = formBuilder.group(db2);
        component.databases = [db1, db1];

        component.editStorage();
        expect(component.databases).toEqual([db2, db1]);
        expect(dbService.updateDatabasesHardDisk).toHaveBeenCalledWith(component.databases);
    });

});
