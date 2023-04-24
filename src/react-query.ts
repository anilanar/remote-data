import * as RQC from "@tanstack/query-core";
import * as Q from "./query";
import * as S from "./stream";
import * as AR from "./async-result";

export type QueryContext = { queryClient: RQC.QueryClient };

export const mkQuery =
  <A, E, TQueryKey extends RQC.QueryKey = RQC.QueryKey>(
    queryOptions: RQC.QueryObserverOptions<A, E, A, A, TQueryKey>
  ): Q.Query<A, E, QueryContext> =>
  (context) => {
    const observer = new RQC.QueryObserver(context.queryClient, queryOptions);
    return S.mkStream(
      () => queryResultToAsyncResult(observer.getCurrentResult()),
      (emit) => () => {
        const unsubscribe = observer.subscribe((queryResult) => {
          emit(queryResultToAsyncResult(queryResult))();
        });
        return { unsubscribe };
      }
    );
  };

const queryResultToAsyncResult = <A, E>(
  queryResult: RQC.QueryObserverResult<A, E>
): AR.AsyncResult<A, E> => {
  if (queryResult.status === "loading") return AR.loading;
  if (queryResult.status === "success") return AR.success(queryResult.data);
  return AR.error(queryResult.error);
};
