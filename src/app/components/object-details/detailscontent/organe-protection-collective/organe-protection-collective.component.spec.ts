import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrganeProtectionCollectiveComponent } from './organe-protection-collective.component';

describe('OrganeProtectionCollectiveComponent', () => {
  let component: OrganeProtectionCollectiveComponent;
  let fixture: ComponentFixture<OrganeProtectionCollectiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganeProtectionCollectiveComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganeProtectionCollectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
