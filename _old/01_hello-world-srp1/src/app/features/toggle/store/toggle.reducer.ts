import { createFeature, createReducer, on } from '@ngrx/store';
import { TogglePageActions } from './toggle.actions';

export interface ToggleState {
  isOn: boolean; // ここ
}

const initialState: ToggleState = {
  isOn: false,
};

export const toggleFeature = createFeature({
  name: 'toggle',
  reducer: createReducer(
    initialState,
    // 状態更新
    on(TogglePageActions.buttonClicked, (state) => ({
      ...state,
      isOn: !state.isOn,
    })),
  ),
});

/** ストアの読み取り口。利用側は toggleFeature の内部構造に依存せずここを参照する */
export const ToggleSelectors = {
  // toggleFeature.selectIsOn の selectIsOn は、
  //   isOn: boolean を見て自動生成されるので変える場合は、interfaceから変えれば良い
  // また、項目名は任意だが、toggleFeature.selectIsOn に合わせて selectIsOn のように同名にするのが慣習
  selectIsOn: toggleFeature.selectIsOn,
};
