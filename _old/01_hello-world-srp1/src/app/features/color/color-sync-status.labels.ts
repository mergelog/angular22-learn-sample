import { ColorSyncStatus } from './store/color.reducer';

/**
 * 表示文言は view 層で持つ。
 * 多言語対応や文言変更が入ったとき、差し替え対象がここだけに閉じる。
 */
export const COLOR_SYNC_STATUS_LABELS: Record<ColorSyncStatus, string> = {
  idle: '待機中',
  syncing: 'Effect が色を同期中…',
  succeeded: 'Effect による色の同期が完了しました',
};
