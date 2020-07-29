import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FirstsyncComponent } from './firstsync.component';

describe('FirstsyncComponent', () => {
  let component: FirstsyncComponent;
  let fixture: ComponentFixture<FirstsyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstsyncComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FirstsyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
