// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IonicModule } from '@ionic/angular';
// import { IonicStorageModule } from '@ionic/storage';
// import { AppModule } from 'src/app/app.module';
// import { DatabaseService } from 'src/app/services/database.service';
// import { SirsDocService } from 'src/app/services/sirsdoc.service';
//
// import { MateriauHautBasIdGenericComponent } from './materiau-haut-bas-id.component';
//
// describe('MateriauHautBasIdGenericComponent', () => {
//   let component: MateriauHautBasIdGenericComponent;
//   let fixture: ComponentFixture<MateriauHautBasIdGenericComponent>;
//   let dbService: DatabaseService;
//   let sirsDocService: SirsDocService;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ MateriauHautBasIdGenericComponent ],
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
//     fixture = TestBed.createComponent(MateriauHautBasIdGenericComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }));
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
