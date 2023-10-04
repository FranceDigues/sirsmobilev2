// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IonicModule } from '@ionic/angular';
// import { IonicStorageModule } from '@ionic/storage';
// import { SirsDocService } from 'src/app/services/sirsdoc.service';
// import { AppModule } from '../../../../app.module';
// import { DatabaseService } from '../../../../services/database.service';
// import { ObjectDetails } from '../../../../services/object-details.service';
// import { DesordresGenericComponent } from './desordres.component';
//
//
// describe('DesordresGenericComponent', () => {
//   let component: DesordresGenericComponent;
//   let fixture: ComponentFixture<DesordresGenericComponent>;
//   let dbService: DatabaseService;
//   let detailsObject: ObjectDetails;
//   let sirsDocService: SirsDocService;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ DesordresGenericComponent ],
//       imports: [IonicModule.forRoot(), IonicStorageModule.forRoot(), AppModule, RouterTestingModule],
//       providers: []
//     }).compileComponents();
//
//     sirsDocService = TestBed.inject(SirsDocService);
//     sirsDocService.doc = {"epsgCode": "EPSG:2154"};
//
//     dbService = TestBed.inject(DatabaseService);
//     dbService.activeDB = {
//       name: 'test',
//       url: 'geomatys.com',
//       userId: 'test',
//       password: '',
//       context: {
//         authUser: '',
//         showText: '',
//         settings: {
//             geolocation: false,
//             edition: false,
//         },
//         currentView: {
//             zoom: '',
//             coords: '',
//         }
//       }
//     };
//
//     detailsObject = TestBed.inject(ObjectDetails);
//     detailsObject.selectedObject = {
//       desordreList: [],
//       desordreIds: []
//     };
//     detailsObject.tempDesordre = { v: '' };
//
//     fixture = TestBed.createComponent(DesordresGenericComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }));
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
