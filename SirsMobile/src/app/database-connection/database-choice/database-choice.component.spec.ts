import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DatabaseChoiceComponent } from './database-choice.component';

describe('DatabaseChoiceComponent', () => {
  let component: DatabaseChoiceComponent;
  let fixture: ComponentFixture<DatabaseChoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabaseChoiceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
