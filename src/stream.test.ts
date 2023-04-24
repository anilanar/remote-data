import { expect, test, describe } from "@jest/globals";
import * as S from "./stream";
import { pipe } from "fp-ts/function";

describe("sync", () => {
  test("map", () => {
    const stream = pipe(
      S.of(1),
      S.map((x) => x + 1)
    );
    expect(stream().getValue()).toBe(2);
  });

  test("chain", () => {
    const stream = pipe(
      S.of(1),
      S.chain((x) => S.of(x + 1))
    );
    expect(stream().getValue()).toBe(2);
  });

  test("ap", () => {
    const stream = pipe(
      S.of(1),
      S.ap(
        pipe(
          S.of(2),
          S.map((x) => (y) => x + y)
        )
      )
    );
    expect(stream().getValue()).toBe(3);
  });
});
