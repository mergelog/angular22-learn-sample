import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';

export type SearchResultType = 'project' | 'experiment' | 'model';

export interface SearchResult {
  readonly id: string;
  readonly type: SearchResultType;
  readonly title: string;
  readonly detail: string;
}

export interface SearchResultTemplateContext {
  readonly $implicit: SearchResult;
}

@Component({
  selector: 'app-c08-search-results',
  imports: [NgTemplateOutlet],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults {
  readonly items = input.required<readonly SearchResult[]>();
  readonly projectTemplate = input.required<TemplateRef<SearchResultTemplateContext>>();
  readonly experimentTemplate = input.required<TemplateRef<SearchResultTemplateContext>>();
  readonly modelTemplate = input.required<TemplateRef<SearchResultTemplateContext>>();

  templateFor(result: SearchResult): TemplateRef<SearchResultTemplateContext> {
    switch (result.type) {
      case 'project':
        return this.projectTemplate();
      case 'experiment':
        return this.experimentTemplate();
      case 'model':
        return this.modelTemplate();
    }
  }
}
