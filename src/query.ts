import * as S from "./stream";
import * as AR from "./async-result";
import { pipe } from "fp-ts/lib/function";
import {} from "fp-ts/Reader";

export type Query<A, E, R> = (context: R) => S.Stream<AR.AsyncResult<A, E>>;

export const of =
  <A, E, R>(value: A): Query<A, E, R> =>
  () =>
    S.of(AR.of(value));

export const map =
  <A, B>(f: (a: A) => B) =>
  <E, R>(fa: Query<A, E, R>): Query<B, E, R> =>
  (context) =>
    pipe(
      fa(context),
      S.map((a) => pipe(a, AR.map(f)))
    );

export const ap =
  <A, B, E, R>(fab: Query<(a: A) => B, E, R>) =>
  (fa: Query<A, E, R>): Query<B, E, R> =>
  (context) => {
    const ga = fa(context);
    const gab = pipe(
      fab(context),
      S.map((ar) => (ha: AR.AsyncResult<A, E>) => pipe(ha, AR.ap(ar)))
    );

    return pipe(ga, S.ap(gab));
  };

export const chain =
  <A, B, E, R>(f: (a: A) => Query<B, E, R>) =>
  (fa: Query<A, E, R>): Query<B, E, R> => {
    return (context) =>
      pipe(
        fa(context),
        S.chain((ga) =>
          pipe(
            ga,
            AR.map((a) => f(a)(context)),
            (ar) => (ar.type !== "success" ? S.of(ar) : ar.value)
          )
        )
      );
  };

export const traverseArray =
  <A, B, E, R>(f: (a: A) => Query<B, E, R>) =>
  (ta: A[]): Query<B[], E, R> => {
    return ta.reduce<Query<B[], E, R>>(
      (acc, a) =>
        pipe(
          f(a),
          ap(
            pipe(
              acc,
              map((bs) => (b: B) => [...bs, b])
            )
          )
        ),
      of<B[], E, R>([])
    );
  };
