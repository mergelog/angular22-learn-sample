import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-sample-10-material-overlay',
  imports: [P00NgrxNavi, MatButtonModule, MatDialogModule, MatIconModule, MatMenuModule],
  templateUrl: './sample-10-material-overlay.html',
  styleUrl: './sample-10-material-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample10MaterialOverlay {
  private readonly dialog = inject(MatDialog);

  readonly actions = ['再実行', 'アーカイブ', '共有'] as const;
  readonly result = signal('メニューから操作を選んでください。');

  openConfirmation(action: string): void {
    // [■観点:MatDialog] Component を通常の親子ツリー外の overlay として開く。
    this.dialog
      .open(ConfirmDialog, { data: { action }, width: '360px' })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        this.result.set(
          confirmed ? `「${action}」を実行しました。` : `「${action}」を取り消しました。`,
        );
      });
  }
}
