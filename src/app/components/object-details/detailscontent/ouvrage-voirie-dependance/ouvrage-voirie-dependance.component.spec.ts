import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { DatabaseService } from 'src/app/services/database.service';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { AppModule } from '../../../../app.module';
import { OuvrageVoirieDependanceComponent } from './ouvrage-voirie-dependance.component';


describe('OuvrageVoirieDependanceComponent', () => {
  let component: OuvrageVoirieDependanceComponent;
  let fixture: ComponentFixture<OuvrageVoirieDependanceComponent>;
  let dbService: DatabaseService;
  let detailsObject: ObjectDetails;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OuvrageVoirieDependanceComponent ],
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

    fixture = TestBed.createComponent(OuvrageVoirieDependanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
