// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { IonicModule } from '@ionic/angular';
//
// import { MateriauIdGenericComponent } from './materiau-id.component';
// import { AppModule } from '../../../../app.module';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IonicStorageModule } from '@ionic/storage';
// import { DatabaseService } from 'src/app/services/database.service';
// import { SirsDocService } from 'src/app/services/sirsdoc.service';
//
// describe('MateriauIdGenericComponent', () => {
//   let component: MateriauIdGenericComponent;
//   let fixture: ComponentFixture<MateriauIdGenericComponent>;
//   let dbService: DatabaseService;
//   let sirsDocService: SirsDocService;
//
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ MateriauIdGenericComponent ],
//       imports: [IonicModule.forRoot(), IonicStorageModule.forRoot(), AppModule, RouterTestingModule]
//     }).compileComponents();
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
//     sirsDocService = TestBed.inject(SirsDocService);
//     sirsDocService.doc = {"epsgCode": "EPSG:2154"};
//
//     fixture = TestBed.createComponent(MateriauIdGenericComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }));
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
