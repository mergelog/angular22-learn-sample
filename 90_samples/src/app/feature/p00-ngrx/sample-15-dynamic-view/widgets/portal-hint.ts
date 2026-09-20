import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample-15-portal-hint',
  template: `
    <aside>
      <strong>Portal の内容</strong>
      <span>表示場所と内容の作成場所を分離できます。</span>
    </aside>
  `,
  styles: `
    aside {
      display: grid;
      gap: 6px;
      padding: 14px;
      border: 1px dashed #ef6c00;
      background: #fff8e1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalHint {}
