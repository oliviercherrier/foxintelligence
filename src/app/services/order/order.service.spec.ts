import { TestBed } from '@angular/core/testing';

import { OrderService } from './order.service';

describe('HtmlToJsonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderService = TestBed.get(OrderService);
    expect(service).toBeTruthy();
  });
});
