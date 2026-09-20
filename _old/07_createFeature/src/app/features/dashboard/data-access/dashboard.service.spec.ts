import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';

import { DashboardActions } from '../store/dashboard.actions';
import { DashboardSelectors } from '../store/dashboard.selectors';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideMockStore()],
    });
  });

  it('starts polling when the feature service is created', () => {
    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');

    TestBed.inject(DashboardService);

    expect(dispatch).toHaveBeenCalledWith(DashboardActions.pollingStarted());
  });

  it('exposes the dashboard view model from the store', async () => {
    const expectedViewModel = {
      items: [],
      loading: true,
      error: null,
    };
    const store = TestBed.inject(MockStore);

    store.overrideSelector(DashboardSelectors.selectViewModel, expectedViewModel);

    const service = TestBed.inject(DashboardService);

    await expect(firstValueFrom(service.viewModel$)).resolves.toEqual(expectedViewModel);
  });

  it('dispatches a load request for a manual refresh', () => {
    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');
    const service = TestBed.inject(DashboardService);

    service.refresh();

    expect(dispatch).toHaveBeenCalledWith(DashboardActions.loadRequested());
  });

  it('stops polling when the feature service is destroyed', () => {
    const store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');

    TestBed.inject(DashboardService);
    TestBed.resetTestingModule();

    expect(dispatch).toHaveBeenCalledWith(DashboardActions.pollingStopped());
  });
});
