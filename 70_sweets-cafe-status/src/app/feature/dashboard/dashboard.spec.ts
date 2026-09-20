import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  it('各featureへのリンクを表示する', () => {
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
      (link) => link.getAttribute('href'),
    );

    expect(links).toEqual(['/cafe-status', '/view-json']);
  });
});
