// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IonicModule } from '@ionic/angular';
// import { IonicStorageModule } from '@ionic/storage';
// import { AppModule } from 'src/app/app.module';
// import { DatabaseService } from 'src/app/services/database.service';
// import { EditObjectService } from 'src/app/services/edit-object.service';
// import { SirsDocService } from 'src/app/services/sirsdoc.service';
// import { StationPompageComponent } from './station-pompage.component';
//
// describe('StationPompageComponent FormTemplate', () => {
//   let component: StationPompageComponent;
//   let fixture: ComponentFixture<StationPompageComponent>;
//   let dbService: DatabaseService;
//   let sirsDocService: SirsDocService;
//   let editObjectService: EditObjectService;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ StationPompageComponent ],
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
//     editObjectService = TestBed.inject(EditObjectService);
//     editObjectService.refs = {
//         RefCategorieDesordre: [],
//         RefCote: [],
//         RefFonction: [],
//         RefTypeGlissiere: [],
//         RefReferenceHauteur: [],
//         RefMateriau: [],
//         RefNature: [],
//         RefOrientationOuvrage: [],
//         OuvrageRevanche: [],
//         RefRevetement: [],
//         RefSeuil: [],
//         RefOuvrageFranchissement: [],
//         RefUsageVoie: [],
//         RefPosition: [],
//         RefReseauHydroCielOuvert: [],
//         ReseauHydrauliqueFerme: [],
//         EchelleLimnimetrique: [],
//         RefEcoulement: [],
//         RefImplantation: [],
//         RefConduiteFermee: [],
//         RefUtilisationConduite: [],
//         RefLargeurFrancBord: [],
//         RefOuvrageHydrauliqueAssocie: [],
//         RefOuvrageTelecomEnergie: [],
//         ReseauTelecomEnergie: [],
//         RefVoieDigue: [],
//         RefReseauTelecomEnergie: [],
//         OuvrageTelecomEnergie: [],
//         RefOuvrageParticulier: [],
//         RefOuvrageVoirie: [],
//         RefTypeDesordre: []
//     };
//     editObjectService.objectDoc = {};
//
//     fixture = TestBed.createComponent(StationPompageComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }));
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
