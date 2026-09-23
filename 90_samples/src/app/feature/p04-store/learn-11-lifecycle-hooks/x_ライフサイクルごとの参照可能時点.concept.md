# ライフサイクルごとの参照可能時点

## 関数詳細

`ngOnInit()` では初期 input、`ngAfterContentInit()` では投影された要素、`ngAfterViewInit()` では自身のビュー要素を利用できる。

## どういうケースで使用するか

input の初期値を使う処理や、`contentChild()`・`viewChild()` で取得した要素の初期処理を行う場合に使用する。

## 注意点

constructor では必須 input やクエリ結果を利用しない。DOM を直接操作する場合はブラウザ環境への依存と Angular の状態管理から外れる点にも注意する。
