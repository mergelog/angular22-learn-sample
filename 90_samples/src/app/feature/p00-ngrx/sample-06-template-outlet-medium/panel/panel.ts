import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-panel',
  imports: [NgTemplateOutlet],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Panel {
  @ContentChild('bodyTemplate') bodyTemplate?: TemplateRef<unknown>;
}
