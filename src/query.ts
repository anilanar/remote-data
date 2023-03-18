import { pipe } from "./pipe";
import * as S from "./stream";
import * as AR from "./async-result";
export type Query<A, E, R> = (context: R) => S.Stream<AR.AsyncResult<A, E>>;

export const of =
  <A>(value: A) =>
  () =>
    S.of(value);

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
        S.map((ga) =>
          pipe(
            ga,
            AR.map((a) => f(a)(context)),
            (ar) => (ar.type !== "success" ? S.of(ar) : ar.value)
          )
        ),
        S.chain((x) => x)
      );
  };
