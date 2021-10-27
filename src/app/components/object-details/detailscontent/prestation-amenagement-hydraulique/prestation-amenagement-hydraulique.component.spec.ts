import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrestationAmenagementHydrauliqueComponent } from './prestation-amenagement-hydraulique.component';

describe('PrestationAmenagementHydrauliqueComponent', () => {
  let component: PrestationAmenagementHydrauliqueComponent;
  let fixture: ComponentFixture<PrestationAmenagementHydrauliqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrestationAmenagementHydrauliqueComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrestationAmenagementHydrauliqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
