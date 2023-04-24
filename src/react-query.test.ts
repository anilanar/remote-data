import { test, expect } from "@jest/globals";
import * as RQ from "./react-query";
import * as Q from "./query";
import { pipe } from "fp-ts/function";
import { QueryClient } from "@tanstack/query-core";

test("ap", (done) => {
  const one = RQ.mkQuery({
    queryKey: ["foo"],
    queryFn: () => Promise.resolve(1),
  });

  const two = RQ.mkQuery({
    queryKey: ["bar"],
    queryFn: () => Promise.resolve(2),
  });

  const three = pipe(
    one,
    Q.ap(
      pipe(
        two,
        Q.map((a) => (b) => a + b)
      )
    )
  );

  const queryClient = new QueryClient();

  const stream = three({ queryClient })();

  const value = stream.getValue();

  expect(value.type).toBe("loading");

  const { unsubscribe } = stream.subscribe((val) => () => {
    if (val.type === "success") {
      expect(val.value).toBe(3);
      unsubscribe();
      done();
    }
  })();
});

test("chain", (done) => {
  const one = RQ.mkQuery({
    queryKey: ["foo"],
    queryFn: () => Promise.resolve(1),
  });

  const query = pipe(
    one,
    Q.chain((val) =>
      RQ.mkQuery({
        queryKey: ["bar"],
        queryFn: () => Promise.resolve(val + 1),
      })
    )
  );

  const queryClient = new QueryClient();

  const stream = query({ queryClient })();

  const value = stream.getValue();

  expect(value.type).toBe("loading");

  const { unsubscribe } = stream.subscribe((val) => () => {
    if (val.type === "success") {
      expect(val.value).toBe(2);
      unsubscribe();
      done();
    }
  })();
});
