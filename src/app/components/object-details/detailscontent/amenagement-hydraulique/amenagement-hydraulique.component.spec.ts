import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AmenagementHydrauliqueComponent } from './amenagement-hydraulique.component';

describe('AmenagementHydrauliqueComponent', () => {
  let component: AmenagementHydrauliqueComponent;
  let fixture: ComponentFixture<AmenagementHydrauliqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmenagementHydrauliqueComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AmenagementHydrauliqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
