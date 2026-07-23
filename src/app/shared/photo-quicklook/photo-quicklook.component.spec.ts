import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';

import { PhotoQuicklookComponent } from './photo-quicklook.component';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { MatIconModule } from "@angular/material/icon";

describe('PhotoQuicklookComponent', () => {
  let component: PhotoQuicklookComponent;
  let fixture: ComponentFixture<PhotoQuicklookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoQuicklookComponent ],
      imports: [IonicModule.forRoot(), HttpClientModule, MatIconTestingModule, MatIconModule],
      providers: [File, FileOpener, WebView, NativeStorage]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoQuicklookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
