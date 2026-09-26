
---
--- 従来NgRXとの対応表
---
---


| 従来NgRx                     | SignalStore Events                           |
| -------------------------- | -------------------------------------------- |
| `createActionGroup()`      | `eventGroup()`                               |
| `props<T>()`               | `type<T>()`                                  |
| `store.dispatch()`         | `Dispatcher.dispatch()` / `injectDispatch()` |
| `createReducer()` + `on()` | `withReducer()` + `on()`                     |
| `Actions` + `ofType()`     | `Events` + `events.on()`                     |
| `createEffect()`           | `withEventHandlers()` に近い                    |

--- linkedSignal、withLinkedState

|      | `linkedSignal()`       | `withLinkedState()`          |
| ---- | ---------------------- | ---------------------------- |
| 所属   | Angular                | NgRx SignalStore             |
| 使う場所 | Component / Service など | `signalStore(...)` の中        |
| 発想   | 連動する writable state    | 連動する Store state             |
| 前回値  | `previous` を取得可能       | 内部で `linkedSignal` 的な仕組みを使える |
| 関係   | 基本機能側                  | Store向けに組み込む側                |


- memo: 以下を使った、超シンプルな、sample作成
 `eventGroup()`                               
 `type<T>()`                                  
 `Dispatcher.dispatch()` / `injectDispatch()` 
 `withReducer()` + `on()`                     
 `Events` + `events.on()`                     
 `withEventHandlers()` に近い                 

