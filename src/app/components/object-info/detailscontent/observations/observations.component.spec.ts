import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { AppModule } from 'src/app/app.module';
import { DatabaseService } from 'src/app/services/database.service';
import { ObjectDetails } from 'src/app/services/object-details.service';
import { ObservationsGenericComponent } from './observations.component';


describe('ObservationsGenericComponent', () => {
  let component: ObservationsGenericComponent;
  let fixture: ComponentFixture<ObservationsGenericComponent>;
  let dbService: DatabaseService;
  let detailsObject: ObjectDetails;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationsGenericComponent ],
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
      observations: [],
    };

    fixture = TestBed.createComponent(ObservationsGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
