# Directive 抽象基底クラスの input を継承

## 関数詳細

`@Directive()` を付けた `NameBase` に `input.required<string>()` を定義する。`InheritedGreeting extends NameBase` は空のクラスでも `name` を入力として受け取れる。

## どういうケースで使用するか

複数のコンポーネントで、共通の入力や処理を使いたい場合。

## 注意点

`abstract` は直接インスタンス化できない基底クラスを表す。`@Directive()` は Angular に入力を認識させるために付ける。親は継承先に必須の `[name]` を渡す。

入力のほか、出力やホストバインディングも継承される。ライフサイクルメソッドを上書きして基底の処理も実行したい場合は、`super.ngOnInit()` などを呼ぶ。

[Angular 公式: 継承](https://angular.dev/guide/components/inheritance)
