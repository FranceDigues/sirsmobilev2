// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IonicModule } from '@ionic/angular';
// import { IonicStorageModule } from '@ionic/storage';
// import { DatabaseService } from 'src/app/services/database.service';
// import { ObjectDetails } from 'src/app/services/object-details.service';
// import { SirsDocService } from 'src/app/services/sirsdoc.service';
// import { AppModule } from '../../../../app.module';
// import { ReseauTelecomEnergieComponent } from './reseau-telecom-energie.component';
//
//
// describe('ReseauTelecomEnergieComponent', () => {
//   let component: ReseauTelecomEnergieComponent;
//   let fixture: ComponentFixture<ReseauTelecomEnergieComponent>;
//   let dbService: DatabaseService;
//   let detailsObject: ObjectDetails;
//   let sirsDocService: SirsDocService;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ ReseauTelecomEnergieComponent ],
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
//       prestationIds: [],
//     };
//     detailsObject.prestationList = [];
//     detailsObject.tempDesordre = { v: '' };
//
//     fixture = TestBed.createComponent(ReseauTelecomEnergieComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }));
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
