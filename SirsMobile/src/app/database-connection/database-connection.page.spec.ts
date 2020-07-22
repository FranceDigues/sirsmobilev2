import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DatabaseConnectionPage } from './database-connection.page';

describe('DatabaseConnectionPage', () => {
  let component: DatabaseConnectionPage;
  let fixture: ComponentFixture<DatabaseConnectionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabaseConnectionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseConnectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
