import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FooService } from '../../../web-app-common/store/foo/foo.service';

@Component({
  selector: 'app-listing-foo',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './listing-foo.html',
  styleUrl: './listing-foo.scss',
})
export class ListingFoo {
  private readonly fooService = inject(FooService);

  protected readonly viewModel$ = this.fooService.viewModel$;

  protected refresh(): void {
    this.fooService.refresh();
  }
}
