import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StructureAmenagementHydrauliqueComponent } from './structure-amenagement-hydraulique.component';

describe('StructureAmenagementHydrauliqueComponent', () => {
  let component: StructureAmenagementHydrauliqueComponent;
  let fixture: ComponentFixture<StructureAmenagementHydrauliqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureAmenagementHydrauliqueComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StructureAmenagementHydrauliqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
