import { TestBed } from '@angular/core/testing';

import { ElasticService } from './elastic.service';

describe('ElasticService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ElasticService = TestBed.get(ElasticService);
    expect(service).toBeTruthy();
  });
});
