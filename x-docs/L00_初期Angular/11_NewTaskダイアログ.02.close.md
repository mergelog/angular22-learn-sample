
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

```ts

  createExperiment = createEffect(() => {
    return this.actions$.pipe(
      ofType(exActions.createExperiment),
      concatLatestFrom(() => this.store.select(selectSelectedProjectId)),
      switchMap(([action, projectId]) => this.apiTasks.tasksCreate({
          project: projectId,
          name: action.data.name,
          type: action.data.taskType ?? 'training',
          script: {
            repository: action.data.repo,
            ...(action.data.type === 'branch' ?
                {branch: action.data.branch ?? 'master'} :
                action.data.type === 'tag' ?
                  {tag: action.data.tag} :
                  {version_num: action.data.commit}
            ),
            working_dir: action.data.directory,
            entry_point: action.data.script,
            binary: action.data.binary,
            requirements: action.data.requirements === 'manual' ? {pip: action.data.pip} : null,
            diff: action.data.uncommited
          },
          hyperparams: {
          Args: action.data.args
            .filter(arg => arg.key?.length > 0)
            .reduce((acc, arg) => {
              const name = arg.key.startsWith('--') ? arg.key.slice(2) : arg.key;
              acc[name] = {name, value: arg.value, section: 'Args'};
              return acc;
            }, {})
          },
          ...(action.data.output && {output_dest: action.data.output}),
          container: {
            ...(action.data.docker.image && {
              image: action.data.docker.image,
              setup_shell_script: action.data.docker.script
            }),
            arguments: `${action.data.docker.args}${action.data.taskInit ? ' -e CLEARML_AGENT_FORCE_TASK_INIT=1' : ''}${action.data.poetry ? ' -e CLEARML_AGENT_FORCE_POETRY' : ''}${action.data.venvType === 'manual' ? ' -e CLEARML_AGENT_SKIP_PIP_VENV_INSTALL=' + action.data.venv : ''}${action.data.requirements === 'skip' ? ' -e CLEARML_AGENT_SKIP_PYTHON_ENV_INSTALL=1' : ''}`
              .concat(action.data.vars?.map(v => ` -e ${v.key}:${v.value}`).join('') ?? '')
              .trimStart()
          }
        } as TasksCreateRequest).pipe(
          map((res: TasksCreateResponse) => exActions.createExperimentSuccess({data: {...action.data, id: res.id}, project: projectId}))
      )),
      catchError(error => [addMessage(MESSAGES_SEVERITY.ERROR, `Failed to create tasks.\n${this.errService.getErrorMsg(error.error)}`)])
    );
  });
```












