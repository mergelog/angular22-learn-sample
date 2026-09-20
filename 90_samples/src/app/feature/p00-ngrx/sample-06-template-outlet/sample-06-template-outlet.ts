import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ReportRow } from './models/report-row';
import { ReportTable } from './report-table/report-table';

@Component({
  selector: 'app-sample-06-template-outlet',
  imports: [P00NgrxNavi, ReportTable],
  templateUrl: './sample-06-template-outlet.html',
  styleUrl: './sample-06-template-outlet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample06TemplateOutlet {
  readonly showDetails = signal(false);

  readonly reports: readonly ReportRow[] = [
    { id: 1, service: 'API', status: '成功', updatedAt: '10:20', owner: '田中' },
    { id: 2, service: 'Web', status: '確認中', updatedAt: '10:25', owner: '佐藤' },
  ];

  toggleDetails(): void {
    this.showDetails.update((showDetails) => !showDetails);
  }
}
