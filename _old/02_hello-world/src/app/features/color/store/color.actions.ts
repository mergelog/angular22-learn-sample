import { createActionGroup, emptyProps, props } from '@ngrx/store';

/** Effect（副作用）側が発行するアクション */
export const ColorActions = createActionGroup({
  source: 'Color Sync',
  events: {
    'Sync Started': emptyProps(),
    'Sync Succeeded': props<{ color: string }>(),
  },
});

/**
 * 画面（ColorPickerForm コンポーネント）側が発行するアクション。
 * source を発生源の名前にしておくと、DevTools のログを見たときに
 * 「どこ由来のアクションか」が type だけで分かる。
 */
export const ColorPickerFormActions = createActionGroup({
  source: 'Color Picker Form',
  events: {
    'Color Picked': props<{ color: string }>(),
  },
});
