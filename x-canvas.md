## 01: SearchComponent

- in: `(input)` → `onValueChange()`。この使用箇所では `enableSearchOnSubmit` の入力束縛がなく既定値は `false` [▶️](src/app/webapp-common/shared/ui-components/inputs/search/search.component.html#L21)
- process: `value$.next(...)` → debounce / filter → `valueChanged.emit(value)` [▶️](src/app/webapp-common/shared/ui-components/inputs/search/search.component.ts#L68)
- out: `valueChanged: output<string>()` → 親の `(valueChanged)="searchTable($event)"` [▶️](src/app/webapp-common/experiments/containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component.html#L23)
- service: この `input` イベントから到達する通信は未検出

## 02: EditableSectionComponent

- relation: `SearchComponent` は `[search-button]` 枠へ投影される。検索値の受け渡しは担当しない [▶️](src/app/webapp-common/shared/ui-components/panel/editable-section/editable-section.component.html#L19)

## 03: ExperimentInfoHyperParametersFormContainerComponent

- in: `searchTable($event)` に検索文字列を渡す
- process: `searchedText` 更新 → `executionParamsForm().jumpToNextResult(...)`
- state: 表の検索位置と一致件数を更新
- out: 表示用の `[searchedText]` へ値を渡す