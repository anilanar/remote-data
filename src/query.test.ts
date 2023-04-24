import { expect, test, describe } from "@jest/globals";
import * as Q from "./query";
import { pipe } from "fp-ts/function";

describe("sync", () => {
  test("map", () => {
    const query = pipe(
      Q.of(1),
      Q.map((x) => x + 1)
    );
    const stream = query({})();
    expect(stream.getValue()).toBe(2);
  });

  test("chain", () => {
    const query = pipe(
      Q.of(1),
      Q.chain((x) => Q.of(x + 1))
    );
    const stream = query({})();
    expect(stream.getValue()).toBe(2);
  });

  test("ap", () => {
    const query = pipe(
      Q.of(1),
      Q.ap(
        pipe(
          Q.of(2),
          Q.map((x) => (y) => x + y)
        )
      )
    );
    const stream = query({})();
    expect(stream.getValue()).toBe(3);
  });
});
