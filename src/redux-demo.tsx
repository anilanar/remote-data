import { useMemo } from "react";
import { pipe } from "fp-ts/function";
import * as Q from "./query";
import * as RX from "./redux";
import { createStore } from "redux";
import { useStore, Provider } from "react-redux";
import { useStream } from "./use-stream";

function useQuery<A, E, S>(query: Q.Query<A, E, RX.QueryContext<S>>) {
  const store = useStore();
  const stream = useMemo(() => {
    return query({ store: store as any });
  }, [query, store]);
  return useStream(stream);
}

interface State {
  hello: string;
  theManWhoSoldTheWorld: string;
}

const initialState: State = {
  hello: "hello  ",
  theManWhoSoldTheWorld: "the man who sold the world",
};

const state = RX.mkQuery<State>();

const fetchHello = pipe(
  state,
  Q.map((s) => s.hello)
);

const fetchTheManWhoSoldTheWorld = pipe(
  state,
  Q.map((s) => s.theManWhoSoldTheWorld)
);

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

const store = createStore((state = initialState) => state);

export const ReduxDemo = () => {
  return (
    <Provider store={store}>
      <Content />
    </Provider>
  );
};
