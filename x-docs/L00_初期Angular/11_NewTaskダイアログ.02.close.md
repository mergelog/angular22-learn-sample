
## ボタン群

create-experiment-dialog.component.html
```html
<div class="buttons">
  <button mat-stroked-button matStepperPrevious>BACK</button>
  <ng-container *ngTemplateOutlet="saveButton"></ng-container>
  <button
    mat-flat-button
    class="tertiary-button"
    [disabled]="codeFormGroup.invalid || dockerFormGroup.invalid || queueFormGroup.invalid"
    (click)="close('run')"
  >RUN</button>
</div>

<ng-template #saveButton>
  <button mat-flat-button
          [disabled]="codeFormGroup.invalid || dockerFormGroup.invalid"
          (click)="close('save')"
  >SAVE AS DRAFT</button>
</ng-template>
```


## クリック時

create-experiment-dialog.component.ts
```ts
  close(action: 'save' | 'run') {
    this.dialog.close({
      action,
      ...this.codeFormGroup.value,
      ...(this.codeFormGroup.controls.scriptType.value === 'module' && {script: `-m ${this.codeFormGroup.value.script}`}),
      ...(this.shell() && this.codeFormGroup.controls.scriptType.value === 'script' && {script: `-c ${this.codeFormGroup.value.script}`}),
      ...(this.codeFormGroup.controls.scriptType.value === 'custom_code' && this.codeFormGroup.controls.repo.value &&
        {uncommited: this.createDiff(this.codeFormGroup.controls.uncommited.value)}
      ),
      ...this.argsFormGroup.value,
      ...this.envFormGroup.value,
      ...(this.envFormGroup.controls.requirements.value === 'manual' && {pip: this.envFormGroup.controls.pip.value}),
      docker: this.dockerFormGroup.value,
      ...this.queueFormGroup.value,
      ...(this.queueFormGroup.controls.queue.value ? {queue: this.queues()?.find(queue => queue.name === this.queueFormGroup.controls.queue.value)} : null),
    } as createExperimentDialogResult)
  }
```

## 上記値を持って afterClose が呼ばれる

> 上記ダイアログ・コンポーネント・クラス名「CreateExperimentDialogComponent」で参照を探せば  
> this.dialog.open(CreateExperimentDialogComponent..  
> this.dialogRef.open(CreateExperimentDialogComponent..  
> などを探せば見つかる

afterCloseで後続処理を実施する。ここでは dispatch

src/app/webapp-common/experiments/experiments.component.ts
```ts

  newExperiment() {  //:: 新規実験作成ボタンから呼ばれるハンドラ
    this.dialog.open(CreateExperimentDialogComponent, {  //:: MatDialogで実験作成モーダルを開く（戻り値はMatDialogRef）
      width: '800px',  //:: モーダル幅の指定
      disableClose: true  //:: 背景クリックやEscでの閉鎖を禁止（明示的なボタン操作のみで閉じる）
    }).afterClosed()  //:: モーダルが閉じた時に閉鎖結果を1回だけ流すObservableを取得
      .pipe(filter(res => !!res))  //:: キャンセル時（undefined/false）を除外し、作成データがある場合のみ通す
      .subscribe(data => this.store.dispatch(experimentsActions.createExperiment({data})));  //:: 作成データをNgRxアクションでdispatchし、以降の生成処理はEffectsに委譲
  }
```

dispatchから以下effectにつながる
- switchMapから初頭処理から　this.apiTasks.tasksCreate を呼ぶ
- this.apiTasks.tasksCreate はHTTP送信

```ts
  createExperiment = createEffect(() => { //:: Create Task ダイアログの送信を受けて tasks.create を叩く Effect
    return this.actions$.pipe(
      ofType(exActions.createExperiment), //:: createExperiment アクションだけ通す
      concatLatestFrom(() => this.store.select(selectSelectedProjectId)), //:: 発火時点で選択中のプロジェクトIDをStoreから1回読み取って渡す
      switchMap(([action, projectId]) => this.apiTasks.tasksCreate({ //:: 連投されたら進行中のリクエストを破棄して最新だけ生かす
          project: projectId, //:: 作成先プロジェクトID。プロジェクト未選択時はセレクタが null を返す
          name: action.data.name,
          type: action.data.taskType ?? 'training', //:: 未指定なら training
          script: { //:: 実行するコードの取得元と実行環境（作業ディレクトリ・バイナリ・依存）の指定
            repository: action.data.repo,
            ...(action.data.type === 'branch' ? //:: 指定方式に応じて branch / tag / version_num のどれか1キーだけ差し込む（branch 未入力なら master）
                {branch: action.data.branch ?? 'master'} :
                action.data.type === 'tag' ?
                  {tag: action.data.tag} :
                  {version_num: action.data.commit}
            ),
            working_dir: action.data.directory, //:: 実行時のカレントディレクトリ
            entry_point: action.data.script, //:: 起動スクリプト（エントリポイント）
            binary: action.data.binary, //:: 実行バイナリ（python3 など）
            requirements: action.data.requirements === 'manual' ? {pip: action.data.pip} : null, //:: manual のときだけ pip 一覧を送る。text/skip は null にして repo の requirements.txt や Agent 側の解決に委ねる
            diff: action.data.uncommited //:: 未コミット差分をパッチとして同梱
          },
          hyperparams: { //:: セクション単位のハイパーパラメータ
          Args: action.data.args //:: Args セクション = コマンドライン引数
            .filter(arg => arg.key?.length > 0) //:: キー未入力の行は捨てる
            .reduce((acc, arg) => { //:: 配列 → API が要求する {キー名: 定義} のマップへ畳み込む
              const name = arg.key.startsWith('--') ? arg.key.slice(2) : arg.key; //:: 先頭の -- を落として正規化
              acc[name] = {name, value: arg.value, section: 'Args'}; //:: name / value / section を持つ定義体に整形
              return acc;
            }, {})
          },
          ...(action.data.output && {output_dest: action.data.output}), //:: 出力先が空ならキーごと省略（null を送らない）
          container: { //:: Docker 実行設定
            ...(action.data.docker.image && { //:: image 未指定なら image と setup_shell_script を送らない（下の arguments は常に送る）
              image: action.data.docker.image,
              setup_shell_script: action.data.docker.script //:: コンテナ起動後に走らせるセットアップスクリプト
            }),
            arguments: `${action.data.docker.args}${action.data.taskInit ? ' -e CLEARML_AGENT_FORCE_TASK_INIT=1' : ''}${action.data.poetry ? ' -e CLEARML_AGENT_FORCE_POETRY' : ''}${action.data.venvType === 'manual' ? ' -e CLEARML_AGENT_SKIP_PIP_VENV_INSTALL=' + action.data.venv : ''}${action.data.requirements === 'skip' ? ' -e CLEARML_AGENT_SKIP_PYTHON_ENV_INSTALL=1' : ''}` //:: docker run 引数。各トグルを -e 環境変数としてテンプレートリテラルで連結
              .concat(action.data.vars?.map(v => ` -e ${v.key}:${v.value}`).join('') ?? '') //:: ユーザ定義の環境変数を後ろに追記
              .trimStart() //:: 先頭に付いた空白を除去
          }
        } as TasksCreateRequest).pipe( //:: リクエスト型へアサーション。必須プロパティ不足や余剰キーの検査が効かなくなる
          //::: 以下は、switchMapの中の this.apiTasks.tasksCreate が返す Observable に対するpipe
          map((res: TasksCreateResponse) => exActions.createExperimentSuccess({data: {...action.data, id: res.id}, project: projectId})) //:: サーバが採番した id を載せて成功アクションへ
      )),
      catchError(error => [addMessage(MESSAGES_SEVERITY.ERROR, `Failed to create tasks.\n${this.errService.getErrorMsg(error.error)}`)]) //:: ここで受けるとストリームが完結し以降このEffectは発火しない（内側 pipe に置くのが定石）
    );
  });
```

`createExperimentSuccess` アクションが dispatch されると、次の3つの Effect がそれぞれ受け取る

- [createExperimentSuccess](/home/mtrysd/work_2026/000-learn-ClearML-pro/src/app/webapp-common/experiments/effects/common-experiments-view.effects.ts:916)：作成成功メッセージを表示
- [updateExperimentsAfterCreate](/home/mtrysd/work_2026/000-learn-ClearML-pro/src/app/webapp-common/experiments/effects/common-experiments-view.effects.ts:923)：実験一覧を更新
- [enqueueCreateExperiment](/home/mtrysd/work_2026/000-learn-ClearML-pro/src/app/webapp-common/experiments/effects/common-experiments-view.effects.ts:937)：`queue` が指定されている場合だけ、作成したタスクをキューに投入

1つの成功アクションを、3つの Effect が独立して監視している。












