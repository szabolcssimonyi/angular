import { TestBed } from '@angular/core/testing';

import { MockBackendInterceptorService } from './mock-backend-interceptor.service';

describe('MockBackendInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MockBackendInterceptorService = TestBed.get(MockBackendInterceptorService);
    expect(service).toBeTruthy();
  });
});
