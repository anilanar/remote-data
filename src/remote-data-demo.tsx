import { createContext, useContext, useMemo } from "react";
import { success } from "./result";
import { pipe } from "./pipe";
import * as Q from "./query";
import * as RD from "./remote-data";
import { useStream } from "./use-stream";

const context: RD.QueryContext = { cache: new Map() };

export const QueryContext = createContext<RD.QueryContext>(context);

function useQuery<A, E>(query: Q.Query<A, E, RD.QueryContext>) {
  const context = useContext(QueryContext);
  const stream = useMemo(() => {
    return query(context);
  }, [query, context]);
  return useStream(stream);
}

const fetchHello = RD.mkQuery("foo", () => Promise.resolve(success("hello ")));

const fetchTheManWhoSoldTheWorld = RD.mkQuery("bar", () =>
  Promise.resolve(success("the man who sold the world"))
);

const p = pipe(
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

export const RemoteDataDemo = () => {
  const single = useQuery(fetchHello);
  const serial = useQuery(s);
  const parallel = useQuery(p);
  useQuery(s);
  useQuery(p);
  useQuery(s);
  useQuery(s);
  useQuery(s);
  useQuery(p);
  useQuery(p);
  useQuery(p);

  return (
    <article>
      <p>
        {single.type} {single.type === "success" ? single.value : ""}
      </p>
      <p>
        {parallel.type} {parallel.type === "success" ? parallel.value : ""}
      </p>
      <p>
        {serial.type} {serial.type === "success" ? serial.value : ""}
      </p>
    </article>
  );
};
