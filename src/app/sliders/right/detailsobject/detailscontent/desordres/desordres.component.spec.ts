import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DesordresComponent } from './desordres.component';

describe('DesordresComponent', () => {
  let component: DesordresComponent;
  let fixture: ComponentFixture<DesordresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesordresComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DesordresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
