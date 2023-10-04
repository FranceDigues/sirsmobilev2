// import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { AlertController, IonicModule, Platform } from '@ionic/angular';
// import { AppModule } from '../../../app.module';
// import { AuthService } from '../../../services/auth.service';
// import { DatabaseService } from '../../../services/database.service';
// import { DatabaseChoiceComponent } from './database-choice.component';
//
// export class MockAlert {
//     public visible: boolean;
//     public header: string;
//     public message: string;
//     public backdropDismiss: boolean;
//     public buttons: Array<any>;
//
//     constructor(props: any) {
//         Object.assign(this, props);
//         this.visible = false;
//     }
//
//     present() {
//         this.visible = true;
//         return Promise.resolve();
//     }
//
//     dismiss() {
//         this.visible = false;
//         return Promise.resolve();
//     }
//
// }
//
// export class MockAlertController {
//
//     public created: MockAlert[];
//
//     constructor() {
//         this.created = [];
//     }
//
//     create(props: any): Promise<any> {
//         const toRet = new MockAlert(props);
//         this.created.push(toRet);
//         return Promise.resolve(toRet);
//     }
//
//     getLast() {
//         if (!this.created.length) {
//             return null;
//         }
//         return this.created[this.created.length - 1];
//     }
// }
//
// describe('Testing DatabaseConnectionPage', () => {
//     let component: DatabaseChoiceComponent ;
//     let fixture: ComponentFixture<DatabaseChoiceComponent>;
//     let dbService: DatabaseService = null;
//     let route: Router;
//     let platform: Platform;
//
//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             imports: [ IonicModule.forRoot({
//                 _testing: true
//             }), AppModule, RouterTestingModule ],
//             declarations: [ DatabaseChoiceComponent ],
//             providers: [
//                 { provide: AlertController, useValue: new MockAlertController() },
//                 DatabaseService, AuthService ]
//         })
//         .compileComponents();
//     }));
//
//     beforeEach(() => {
//         fixture = TestBed.createComponent(DatabaseChoiceComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//         dbService = TestBed.inject(DatabaseService);
//         route = TestBed.inject(Router);
//         platform = TestBed.inject(Platform);
//     });
//
//     afterEach(() => {
//         fixture.destroy();
//         component = null;
//     });
//
//     it('should be created', () => {
//         expect(component).toBeTruthy();
//     });
//
//     it('ngOnInit method should call DatabaseService to get databases stored in hardDisk', (done) => {
//         const res = [
//             {
//                 name: 'example',
//                 url: 'geomatys.com',
//                 userId: 'test',
//                 password: 'test',
//             }
//         ];
//         spyOn(platform, 'ready').and
//         .returnValue(new Promise((resolve) => {
//             resolve('');
//         }));
//         spyOn(dbService, 'getDatabaseSettings').and
//         .returnValue(new Promise((resolve) => {
//             resolve(res);
//         }));
//         component.init();
//         setTimeout(() => {
//             expect(platform.ready).toHaveBeenCalled();
//             expect(dbService.getDatabaseSettings).toHaveBeenCalled();
//             expect(component.databases).toEqual(res);
//             done();
//         }, 10);
//     });
//
//     it('ngOnInit method should call DatabaseService and call error console log', (done) => {
//         spyOn(dbService, 'getDatabaseSettings').and.returnValue(Promise.reject('error'));
//         spyOn(console, 'log');
//
//         component.ngOnInit();
//         setTimeout(() => {
//             expect(dbService.getDatabaseSettings).toHaveBeenCalled();
//             done();
//         }, 10);
//     });
//
//     it('changeStatus method should change status value and update databases value', (done) => {
//         const res = [
//             {
//                 name: 'example',
//                 url: 'geomatys.com',
//                 userId: 'test',
//                 password: 'test',
//             }
//         ];
//         spyOn(dbService, 'getDatabaseSettings').and
//         .returnValue(new Promise((resolve) => {
//             resolve(res);
//         }));
//         component.changeStatus(1);
//         setTimeout(() => {
//             expect(component.status).toEqual(1);
//             expect(dbService.getDatabaseSettings).toHaveBeenCalled();
//             expect(component.databases).toEqual(res);
//             done();
//         }, 10);
//     });
//
//     it('changeStatus method should change status value and call error console log', (done) => {
//         spyOn(dbService, 'getDatabaseSettings').and.returnValue(Promise.reject('error'));
//         spyOn(console, 'log');
//
//         component.changeStatus(1);
//         setTimeout(() => {
//             expect(component.status).toEqual(1);
//             expect(dbService.getDatabaseSettings).toHaveBeenCalled();
//             done();
//         }, 10);
//     });
//
//     it('selectDB method should call DatabaseService changeDatabase`s method,\
//     update activeDatabase and update databaseIndex', () => {
//         const example1 = {
//             name: 'example1',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//         };
//         const example2 = {
//             name: 'example2',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//         };
//         component.databases = [ example1, example2 ];
//         component.selectedDatabase = example1;
//
//         spyOn(dbService, 'changeDatabase');
//         spyOn(dbService, 'setActiveDB');
//
//         expect(component.selectedDatabase).toEqual(example1);
//         component.selectDB(example2);
//         expect(dbService.changeDatabase).toHaveBeenCalled();
//         expect(component.selectedDatabase).toEqual(example2);
//         expect(dbService.setActiveDB).toHaveBeenCalled();
//         expect(component.databaseIndex).toEqual(1);
//     });
//
//     it('addDatabase method should set status variable equal to 1', () => {
//         component.addDatabase();
//         expect(component.status).toEqual(1);
//     });
//
//     it('addDatabase method should set status variable equal to 2', () => {
//         component.editDatabase();
//         expect(component.status).toEqual(2);
//     });
//
//     it('removeDatabase method should create and active an alert which delete or no a databse', fakeAsync(() => {
//         const example1 = {
//             name: 'example1',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//         };
//         const example2 = {
//             name: 'example2',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//         };
//
//         component.databases = [example1, example2];
//         component.databaseIndex = 1;
//         component.selectedDatabase = example2;
//         component.removeDatabase();
//
//         tick(1000);
//
//         const mockAlertController = component.alertCtrl as any as MockAlertController;
//
//         expect(mockAlertController.getLast().visible).toBeTruthy();
//         expect(mockAlertController.getLast().header).toBe('Suppression d\'une base de données');
//         expect(mockAlertController.getLast().message).toBe('Voulez-vous vraiment supprimer cette base de données');
//
//         mockAlertController.getLast().buttons[1].handler.call(this); // Call OK's handler
//
//         expect(component.selectedDatabase).toEqual(null);
//         expect(component.databases).toEqual([example1]);
//     }));
//
//     it('removeDatabase method should do nothing when there is no selected database', fakeAsync(() => {
//         component.selectedDatabase = null;
//
//         component.removeDatabase();
//
//         tick(1000);
//
//         const mockAlertController = component.alertCtrl as any as MockAlertController;
//
//         expect(mockAlertController.getLast()).not.toBeTruthy();
//     }));
//
//     it('validateDatabase method should set status variable equal to 3 if selectedDatabase is not replicated', () => {
//         component.selectedDatabase = {
//             name: 'example',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//             replicated: false
//         };
//
//         component.validateDatabase();
//
//         expect(component.status).toBe(3);
//     });
//
//     it('validateDatabase method should set status variable equal to 4 if selectedDatabase is replicated but user not connected', () => {
//         component.selectedDatabase = {
//             name: 'example',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//             replicated: true,
//             context: {}
//         };
//
//         component.validateDatabase();
//
//         expect(component.status).toBe(4);
//     });
//
//     it('validateDatabase method should redirect to main if dbSelected is replicated and user connected', () => {
//         spyOn(route, 'navigateByUrl');
//
//         const goodDB = {
//             name: 'example',
//             url: 'geomatys.com',
//             userId: 'test',
//             password: 'test',
//             replicated: true,
//             context: {
//                 authUser: 'test'
//             }
//         };
//         component.selectedDatabase = goodDB;
//         dbService.activeDB = goodDB;
//         component.validateDatabase();
//
//         expect(route.navigateByUrl).toHaveBeenCalledWith('/main');
//     });
// });
