import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MediaDetailsComponent } from './media-details.component';
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { MatIconModule } from "@angular/material/icon";

describe('MediaDetailsComponent', () => {
  let component: MediaDetailsComponent;
  let fixture: ComponentFixture<MediaDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaDetailsComponent ],
      imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
