import { TestBed } from '@angular/core/testing';

import { AmService } from './am.service';

describe('AmService', () => {
  let service: AmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
