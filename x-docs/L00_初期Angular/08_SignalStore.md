
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



以下を使った、超シンプルな、sample作成
 `eventGroup()`                               
 `type<T>()`                                  
 `Dispatcher.dispatch()` / `injectDispatch()` 
 `withReducer()` + `on()`                     
 `Events` + `events.on()`                     
 `withEventHandlers()` に近い                 

