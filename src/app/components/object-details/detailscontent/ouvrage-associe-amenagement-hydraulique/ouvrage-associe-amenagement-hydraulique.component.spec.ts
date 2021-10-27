import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OuvrageAssocieAmenagementHydrauliqueComponent } from './ouvrage-associe-amenagement-hydraulique.component';

describe('OuvrageAssocieAmenagementHydrauliqueComponent', () => {
  let component: OuvrageAssocieAmenagementHydrauliqueComponent;
  let fixture: ComponentFixture<OuvrageAssocieAmenagementHydrauliqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OuvrageAssocieAmenagementHydrauliqueComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OuvrageAssocieAmenagementHydrauliqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
