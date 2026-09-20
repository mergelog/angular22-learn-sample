# git worktree 一行マニュアル

## 基本

worktreeでは「作業ファイル・index・HEAD」は各worktreeで独立する。

ブランチ、タグ、`origin/*`、stashなど通常のGit refsは同じリポジトリで共有される。 ([Git][2])

---

## 新しいブランチ＋worktreeを作りたい

```bash
git worktree add -b docs/update ../project-docs HEAD
```

現在の `HEAD` から `docs/update` を作り、`../project-docs` に展開する。最後の `HEAD` は省略可能。

---

## 既存ブランチをworktreeで開きたい

```bash
git worktree add ../project-dev feature/xxx
```

既存の `feature/xxx` を別ディレクトリに展開する。

同じブランチが別worktreeでcheckout中なら通常は拒否される。 ([Git][1])

---

## リモートブランチからworktreeを作りたい

```bash
git worktree add --track -b feature/xxx ../project-dev origin/feature/xxx
```

`origin/feature/xxx` を起点にローカルブランチを作り、upstreamも設定する。

remote-tracking branchを起点にした場合はGitが自動追跡設定する場合もあるが、明示的に `--track` を書くと意図が明確。 ([Git][1])

---

## ブランチを作らず実験用worktreeを作りたい

```bash
git worktree add --detach ../project-test HEAD
```

detached HEADで作成する。

比較、検証、一時的なコード変更など「既存ブランチを動かしたくない用途」に向く。 ([Git][1])

---

## 特定コミット時点を別worktreeで開きたい

```bash
git worktree add --detach ../project-old afbac7f
```

`afbac7f` 時点を開く。既存ブランチは動かない。

---

## 実験用worktreeの変更を残したくなった

```bash
git switch -c feature/keep-test
```

detached HEADで作ったコミットを残したい場合は、worktreeを消す前にブランチを作る。

detached HEADのコミットをブランチ等から参照しないまま離れると、後で参照不能になり最終的に削除され得る。 ([Git][3])

---

## worktree一覧を確認したい

```bash
git worktree list
```

各worktreeのパス、commit、branch、detached状態などを確認する。 ([Git][1])

---

## worktree一覧を詳しく確認したい

```bash
git worktree list --verbose
```

lock理由やprune可能な理由など追加情報も表示する。 ([Git][1])

---

## 今いるブランチを確認したい

```bash
git branch --show-current
```

現在のworktreeのブランチ名を表示する。

detached HEADの場合は空になる。

---

## 操作前に現在地を確認したい

```bash
git status
```

現在のブランチ、detached状態、変更状態を確認する。

`reset` や `rebase` の前に実行する習慣を付けるとworktreeの取り違え防止になる。

---

# 削除

## worktreeを削除したい

```bash
git worktree remove ../project-docs
```

linked worktreeを正規手順で削除する。

dirtyなworktreeは通常削除を拒否される。main worktreeは `worktree remove` では削除できない。 ([Git][1])

---

## 変更ごとworktreeを強制削除したい

```bash
git worktree remove --force ../project-test
```

未コミット変更などがあっても削除する。

内容を失うので、使い捨てworktreeなどに限定する。 ([Git][1])

---

## lock済みworktreeを強制削除したい

```bash
git worktree remove --force --force ../project-test
```

lock済みworktreeを削除する場合は `--force` が2回必要。 ([Git][1])

---

# prune / repair

## worktreeをrmやFinderで直接削除してしまった

```bash
git worktree prune
```

実体がなくなったworktreeについて、残っているGit管理情報を掃除する。

通常は直接削除せず `git worktree remove` を使う。 ([Git][1])

---

## prune対象を先に確認したい

```bash
git worktree prune --dry-run
```

実際には削除せず、prune対象だけ確認する。

---

## worktreeを正規手順で移動したい

```bash
git worktree move ../project-dev ../project-feature
```

linked worktreeをGit管理情報ごと移動する。

main worktreeと、submoduleを含むlinked worktreeはこの方法では移動できない。 ([Git][1])

---

## Finderやmvでlinked worktreeを移動してしまった

```bash
git worktree repair
```

移動によって切れたworktreeとGit管理情報の接続を修復する。 ([Git][1])

---

## 複数worktreeを手動移動してしまった

```bash
git worktree repair ../project-dev ../project-docs
```

指定した各worktreeの新しい場所との接続を修復する。 ([Git][1])

---

## main worktree自体を手動移動してしまった

```bash
git worktree repair
```

移動後のmain worktree内で実行し、linked worktreeからmainへの接続を修復する。 ([Git][1])

---

# lock

## worktreeをpruneなどから保護したい

```bash
git worktree lock ../project-dev
```

外付けSSDやネットワークドライブなど、一時的に見えなくなるworktree向け。

lock中はmoveやremoveも防止される。 ([Git][1])

---

## lock理由を付けたい

```bash
git worktree lock --reason "external SSD" ../project-dev
```

`git worktree list --verbose` で理由も確認できる。

---

## lockを解除したい

```bash
git worktree unlock ../project-dev
```

通常状態へ戻す。

---

# reset

## 現在のworktreeの追跡済み変更を捨てたい

```bash
git reset --hard HEAD
```

現在のworktreeのindexと作業ファイルをHEADへ戻す。

通常の未追跡ファイルは対象外だが、追跡ファイルを書き戻す邪魔になる未追跡ファイルやディレクトリは削除され得る。 ([Git][4])

---

## 現在地点を2コミット戻したい

```bash
git reset --hard HEAD~2
```

branch上なら、そのbranch自体が2コミット戻る。

detached HEADなら既存branchは動かず、そのworktreeのdetached HEADだけが移動する。 ([Git][4])

---

## resetを間違えた

```bash
git reflog
```

reset前のcommitを探す。

見つけたcommitへ戻すなら次。

```bash
git reset --hard <commit>
```

`--hard` は現在の未コミット変更を捨てるので、復旧前に `git status` で確認する。

---

## reset直後の元位置へ戻したい

```bash
git reset --hard ORIG_HEAD
```

`git reset` は実行前の位置を `ORIG_HEAD` に保存する。

ただし、その後ほかのGit操作をしている場合は `reflog` で確認する方が安全。 ([Git][4])

---

# stash

## 作業途中をstashしたい

```bash
git stash push -m "docs: 作業途中"
```

現在のworktreeの変更をstashする。

stashはworktree別ではなく、リポジトリ全体で共有される。 `refs/stash` に保存されるため、別worktreeからも同じstash一覧が見える。 ([Git][5])

---

## 未追跡ファイルもstashしたい

```bash
git stash push -u -m "docs: 作業途中"
```

`-u` で未追跡ファイルも含める。

---

## stash一覧を確認したい

```bash
git stash list
```

全worktree共通のstash一覧を見る。

複数worktree運用では `-m` で用途を書くのがおすすめ。

---

## stashの内容を確認したい

```bash
git stash show -p stash@{0}
```

どのworktreeで作ったstashか分からなくなった場合も、適用前に内容を確認できる。

---

## stashを適用したい

```bash
git stash apply stash@{1}
```

指定stashを現在のworktreeに適用する。

`apply` は成功してもstashを残すので、worktree運用では `pop` より安全寄り。

---

## stage状態も含めてstashを戻したい

```bash
git stash apply --index stash@{1}
```

stash作成時のindex状態も可能な範囲で復元する。

---

## 適用確認後にstashを削除したい

```bash
git stash drop stash@{1}
```

指定stashだけ削除する。

---

# fetch / branch / push

## remoteの最新情報を取得したい

```bash
git fetch origin
```

取得したGitオブジェクトや `origin/*` は同じrepositoryの全worktreeで共有される。

各worktreeで個別に `fetch` する必要は基本ない。 ([Git][2])

---

## 普通にcommitしたい

```bash
git add . && git commit -m "docs: update"
```

通常のGitと同じ。

branch上なら、そのbranchへcommitされる。

detached HEADでもcommit自体はできるが、残したければbranchを作る。

---

## branchをpushしたい

```bash
git push -u origin docs/update
```

通常のGitと同じ。

そのままPRを作成できる。

---

# PRマージ後

## 不要になったworktreeを削除したい

```bash
git worktree remove ../project-docs
```

worktreeだけ削除する。

branch自体は残る。

---

## マージ済みローカルbranchも削除したい

```bash
git branch -d docs/update
```

branchがupstream、またはupstream未設定なら現在のHEADへ完全にmerge済みの場合だけ削除する。 ([Git][6])

---

## GitHubでSquash Mergeしたので `-d` が拒否された

```bash
git branch -D docs/update
```

Squash Mergeでは元branchのcommitそのものはmainに取り込まれないため、Gitからは「fully merged」と判定されないことがある。

PRが確実にマージ済みで、元branchが不要だと確認できた場合だけ `-D` を使う。

---

# 同じbranchを複数worktreeで開く

## 強制的には可能だが原則使わない

```bash
git worktree add --force ../project-main2 main
```

Gitの「同じbranchを複数worktreeでcheckoutしない」安全装置を解除する。

片方でcommit/resetすると共有branch refが動き、もう片方の作業ファイルやindexと食い違う可能性があるため、通常運用では使わない。 ([Git][1])

---

# Git config

## Git設定はworktreeごとか？

通常は違う。

```bash
git config --local user.name
```

`.git/config` はrepository全体で共有されるため、通常のlocal configも全worktree共通。 ([Git][2])

---

## worktreeごとにGit configを持たせたい

最初に一度だけ次を有効化する。

```bash
git config extensions.worktreeConfig true
```

その後、対象worktree内で次のように設定する。

```bash
git config --worktree <key> <value>
```

`config.worktree` に保存され、そのworktreeだけの設定になる。

この機能を有効にすると古いGitではrepositoryを扱えなくなる場合があるため、必要な場合だけ使う。 ([Git][2])

---

# おすすめ構成

```text
project/       → main            基準・確認用
project-docs/  → docs/xxx        docs PR用
project-dev/   → feature/xxx     実装PR用
project-test/  → detached HEAD   比較・検証・使い捨て
```

作成例。

```bash
git worktree add -b docs/xxx ../project-docs HEAD
git worktree add -b feature/xxx ../project-dev HEAD
git worktree add --detach ../project-test HEAD
```

---

# 最低限これだけ覚える

## 新規branch＋worktree

```bash
git worktree add -b <branch> <path> HEAD
```

## 実験用

```bash
git worktree add --detach <path> HEAD
```

## 一覧

```bash
git worktree list
```

## 削除

```bash
git worktree remove <path>
```

## 消したworktreeの管理情報を掃除

```bash
git worktree prune
```

「実体がもう存在しない」場合。

## 移動などで接続が壊れたworktreeを修復

```bash
git worktree repair
```

「実体は存在するがGitとの接続がおかしい」場合。

---

# 実運用で特に注意する4点

1. `stash` は全worktree共通。
2. branchも全worktree共通なので、branch上での `reset --hard HEAD~2` はbranch自体を動かす。
3. 実験用は `--detach` にすると既存branchを動かしにくい。ただしcommitを残したければbranchを作る。
4. `--force` で同じbranchを複数worktreeにcheckoutする運用は原則しない。

[1]: https://git-scm.com/docs/git-worktree "Git - git-worktree Documentation"
[2]: https://git-scm.com/docs/git-worktree?utm_source=chatgpt.com "Git - git-worktree Documentation"
[3]: https://git-scm.com/docs/user-manual?utm_source=chatgpt.com "Git - user-manual Documentation"
[4]: https://git-scm.com/docs/git-reset/2.53.0.html?utm_source=chatgpt.com "Git - git-reset Documentation"
[5]: https://git-scm.com/docs/git-stash/2.14.6?utm_source=chatgpt.com "Git - git-stash Documentation"
[6]: https://git-scm.com/docs/git-branch?utm_source=chatgpt.com "Git - git-branch Documentation"
