import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { DatabaseService } from 'src/app/services/database.service';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { AppModule } from '../../../../app.module';
import { OuvrageHydroAssocieComponent } from './ouvrage-hydro-associe.component';


describe('OuvrageHydroAssocieComponent', () => {
  let component: OuvrageHydroAssocieComponent;
  let fixture: ComponentFixture<OuvrageHydroAssocieComponent>;
  let dbService: DatabaseService;
  let detailsObject: ObjectDetails;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OuvrageHydroAssocieComponent ],
      imports: [IonicModule.forRoot(), IonicStorageModule.forRoot(), AppModule, RouterTestingModule],
      providers: []
    }).compileComponents();

    dbService = TestBed.inject(DatabaseService);
    dbService.activeDB = {
      name: 'test',
      url: 'geomatys.com',
      userId: 'test',
      password: '',
      context: {
        authUser: '',
        showText: '',
        settings: {
            geolocation: false,
            edition: false,
        },
        currentView: {
            zoom: '',
            coords: '',
        }
      }
    };

    detailsObject = TestBed.inject(ObjectDetails);
    detailsObject.selectedObject = {
      prestationIds: [],
    };
    detailsObject.prestationList = [];
    detailsObject.tempDesordre = { v: '' };

    fixture = TestBed.createComponent(OuvrageHydroAssocieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
