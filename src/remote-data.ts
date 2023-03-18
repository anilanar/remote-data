import { noop } from "./utils";
import { mkStream, Stream } from "./stream";
import { AsyncResult } from "./async-result";
import { Result } from "./result";
import * as Q from "./query";
import * as S from "./stream";
import * as AR from "./async-result";

export type QueryKey = string;

export interface QueryContext {
  cache: Map<string, S.Stream<AR.AsyncResult<unknown, unknown>>>;
}

export const mkQuery = <A, E>(
  queryKey: QueryKey,
  fetchFn: () => Promise<Result<A, E>>
): Q.Query<A, E, QueryContext> => (context) => {
  let entry = context.cache.get(queryKey) as Stream<AsyncResult<A, E>> |
    undefined;

  if (entry === undefined) {
    const data: AsyncResult<A, E> = {
      type: "loading",
    };
    entry = mkStream<AsyncResult<A, E>>(data, (emit) => {
      fetchFn().then((value) => {
        emit(value);
      });
      return noop;
    });

    context.cache.set(queryKey, entry);
  }

  return entry;
};
