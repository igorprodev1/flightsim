import { TestBed } from '@angular/core/testing';

import { SimulationServerService } from './simulation-server.service';

describe('SimulationServerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SimulationServerService = TestBed.get(SimulationServerService);
    expect(service).toBeTruthy();
  });
});
