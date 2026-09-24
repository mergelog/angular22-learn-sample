# createFeatureSelector と createSelector で状態を読む

## 関数詳細

`createFeatureSelector` で feature key に対応する状態を取得し、`createSelector` で `name`、`num`、`status` を個別に取り出す。

## どういうケースで使用するか

`createFeature` の自動生成セレクターを使わず、状態から読む値を明示的に定義したいとき。

## 注意点

`createFeatureSelector` の feature key と `provideState` に渡す key を一致させる。異なる場合、セレクターは対象の状態を取得できない。
