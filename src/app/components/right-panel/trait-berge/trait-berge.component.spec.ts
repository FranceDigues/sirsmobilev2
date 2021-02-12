import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TraitBergeComponent } from './trait-berge.component';

describe('TraitBergeComponent', () => {
  let component: TraitBergeComponent;
  let fixture: ComponentFixture<TraitBergeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraitBergeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TraitBergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
