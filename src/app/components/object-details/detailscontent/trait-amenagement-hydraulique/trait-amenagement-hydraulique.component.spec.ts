import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TraitAmenagementHydrauliqueComponent } from './trait-amenagement-hydraulique.component';

describe('TraitAmenagementHydrauliqueComponent', () => {
  let component: TraitAmenagementHydrauliqueComponent;
  let fixture: ComponentFixture<TraitAmenagementHydrauliqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraitAmenagementHydrauliqueComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TraitAmenagementHydrauliqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
