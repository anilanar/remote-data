import * as Redux from "redux";
import * as AR from "./async-result";
import * as Q from "./query";
import * as S from "./stream";

export type QueryContext<S> = { store: Redux.Store<S> };

export const mkQuery =
  <S>(): Q.Query<S, never, QueryContext<S>> =>
  (context) =>
    S.mkStream(AR.of(context.store.getState()), (emit) =>
      context.store.subscribe(() => {
        emit(AR.of(context.store.getState()));
      })
    );
