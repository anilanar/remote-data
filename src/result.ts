export type Result<A, E> =
  | { readonly type: "error"; readonly error: E }
  | { readonly type: "success"; readonly value: A };

export const success = <A>(value: A) => ({ type: "success", value } as const);

export const failure = <E>(error: E) => ({ type: "error", error } as const);

export const of = success;

export const map =
  <A, B>(f: (a: A) => B) =>
  <E>(fa: Result<A, E>): Result<B, E> =>
    fa.type === "success" ? { type: "success", value: f(fa.value) } : fa;

export const ap =
  <E, A, B>(fab: Result<(a: A) => B, E>) =>
  (fa: Result<A, E>): Result<B, E> => {
    if (fa.type === "success") {
      if (fab.type === "success") {
        return { type: "success", value: fab.value(fa.value) };
      } else {
        return { type: "error", error: fab.error };
      }
    } else {
      return { type: "error", error: fa.error };
    }
  };

export const chain =
  <E, A, B>(f: (a: A) => Result<B, E>) =>
  (fa: Result<A, E>): Result<B, E> => {
    if (fa.type === "success") {
      const fb = f(fa.value);
      if (fb.type === "success") {
        return { type: "success", value: fb.value };
      } else {
        return { type: "error", error: fb.error };
      }
    } else {
      return { type: "error", error: fa.error };
    }
  };
