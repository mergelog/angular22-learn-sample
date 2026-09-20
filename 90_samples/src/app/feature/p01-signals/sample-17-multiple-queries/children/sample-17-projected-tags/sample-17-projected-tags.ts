import { ChangeDetectionStrategy, Component, contentChildren } from '@angular/core';
import { Sample17Tag } from '../sample-17-tag/sample-17-tag';
@Component({
  selector: 'app-sample-17-projected-tags',
  template: '<ng-content /> <p>contentChildren: {{ tags().length }} 件</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample17ProjectedTags {
  readonly tags = contentChildren(Sample17Tag);
}
