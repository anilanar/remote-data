import * as Redux from "redux";
import * as AR from "./async-result";
import * as Q from "./query";
import * as S from "./stream";
import { unsafeCoerce } from "fp-ts/lib/function";

export type QueryContext<S> = { store: Redux.Store<S> };

const query: Q.Query<unknown, never, QueryContext<unknown>> = (context) =>
  S.mkStream(
    () => AR.of(context.store.getState()),
    (emit) => () => {
      const unsubscribe = context.store.subscribe(() => {
        emit(AR.of(context.store.getState()));
      });
      return { unsubscribe };
    }
  );

export const mkQuery = <S>(): Q.Query<S, never, QueryContext<S>> =>
  unsafeCoerce(query);
