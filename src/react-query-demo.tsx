import { useMemo } from "react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import * as Q from "./query";
import * as RQ from "./react-query";
import { useStream } from "./use-stream";
import { pipe } from "fp-ts/function";

function useQuery<A, E>(query: Q.Query<A, E, RQ.QueryContext>) {
  const context = useQueryClient();
  const stream = useMemo(() => {
    return query({ queryClient: context });
  }, [query, context]);
  return useStream(stream);
}

const fetchHello = RQ.mkQuery({
  queryKey: ["foo"],
  queryFn: () =>
    Promise.resolve({
      hello: "hello ",
    }),
});

const fetchTheManWhoSoldTheWorld = RQ.mkQuery({
  queryKey: ["bar"],
  queryFn: () =>
    Promise.resolve({
      theMan: "the man who sold the world",
    }),
});

const pp = pipe(
  fetchHello,
  Q.ap(
    pipe(
      fetchTheManWhoSoldTheWorld,
      Q.map((a) => (b) => ({ result: `ap ${b.hello} ${a.theMan}` }))
    )
  )
);

const s = pipe(
  fetchHello,
  Q.chain((a) =>
    pipe(
      fetchTheManWhoSoldTheWorld,
      Q.map((b) => ({ result: `chain ${a.hello} ${b.theMan}` }))
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
        {single.type} {single.type === "success" ? single.value.hello : ""}
      </p>
      <p>
        {parallel.type}{" "}
        {parallel.type === "success" ? parallel.value.result : ""}
      </p>
      <p>
        {serial.type} {serial.type === "success" ? serial.value.result : ""}
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
