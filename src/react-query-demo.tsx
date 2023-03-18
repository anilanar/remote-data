import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { success } from "./result";
import { pipe } from "./pipe";
import * as Q from "./query";
import * as RQ from "./react-query";

function useQuery<A, E>(query: Q.Query<A, E, RQ.QueryContext>) {
  const context = useQueryClient();
  const stream = useMemo(() => {
    return query({ queryClient: context });
  }, [query, context]);

  const getSnapshot = useCallback(() => {
    return stream.getValue();
  }, [stream]);

  const subscribe = useCallback(
    (cb: () => void) => {
      return stream.subscribe((value) => {
        cb();
      });
    },
    [stream]
  );
  const result = useSyncExternalStore(subscribe, getSnapshot);

  const ref = useRef(result);

  useEffect(() => {
    if (result !== ref.current) {
      ref.current = result;
    }
  }, [result]);

  return result;
}

const fetchHello = RQ.mkQuery({
  queryKey: ["foo"],
  queryFn: () => Promise.resolve("hello "),
});

const fetchTheManWhoSoldTheWorld = RQ.mkQuery({
  queryKey: ["bar"],
  queryFn: () => Promise.resolve("the man who sold the world"),
});

const pp = pipe(
  fetchHello,
  Q.ap(
    pipe(
      fetchTheManWhoSoldTheWorld,
      Q.map((a) => (b) => `ap ${b} ${a}`)
    )
  )
);

const s = pipe(
  fetchHello,
  Q.chain((a) =>
    pipe(
      fetchTheManWhoSoldTheWorld,
      Q.map((b) => `chain ${a} ${b}`)
    )
  )
);

const queryClient = new QueryClient();

const Content = () => {
  const single = useQuery(fetchHello);
  const serial = useQuery(s);
  const parallel = useQuery(pp);
  useQuery(s);
  useQuery(pp);
  useQuery(s);
  useQuery(s);
  useQuery(s);
  useQuery(pp);
  useQuery(pp);
  useQuery(pp);

  return (
    <main>
      <p>
        {single.type} {single.type === "success" ? single.value : ""}
      </p>
      <p>
        {parallel.type} {parallel.type === "success" ? parallel.value : ""}
      </p>
      <p>
        {serial.type} {serial.type === "success" ? serial.value : ""}
      </p>
    </main>
  );
};

export const ReactQueryDemo = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Content />
    </QueryClientProvider>
  );
};
