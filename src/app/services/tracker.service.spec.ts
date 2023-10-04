import { TestBed } from '@angular/core/testing';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { TrackerService } from './tracker.service';

describe('TrackerService', () => {
  let service: TrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NativeStorage, Geolocation]
    });
    service = TestBed.inject(TrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
