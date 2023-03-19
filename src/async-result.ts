export type AsyncResult<A, E> =
  | { readonly type: "loading" }
  | { readonly type: "error"; readonly error: E }
  | { readonly type: "success"; readonly value: A };

export const initial = { type: "initial" } as const;
export const loading = { type: "loading" } as const;
export const error = <E>(error: E) => ({ type: "error", error } as const);
export const success = <A>(value: A) => ({ type: "success", value } as const);

export const of = success;

export const map =
  <A, B>(f: (a: A) => B) =>
  <E>(fa: AsyncResult<A, E>): AsyncResult<B, E> =>
    fa.type === "success" ? { type: "success", value: f(fa.value) } : fa;

export const ap =
  <E, A, B>(fab: AsyncResult<(a: A) => B, E>) =>
  (fa: AsyncResult<A, E>): AsyncResult<B, E> => {
    if (fa.type === "success" && fab.type === "success") {
      return { type: "success", value: fab.value(fa.value) };
    }

    if (fa.type === "error") {
      return { type: "error", error: fa.error };
    }

    if (fab.type === "error") {
      return { type: "error", error: fab.error };
    }

    return { type: "loading" };
  };

export const chain =
  <E, A, B>(f: (a: A) => AsyncResult<B, E>) =>
  (fa: AsyncResult<A, E>): AsyncResult<B, E> => {
    if (fa.type === "success") {
      const fb = f(fa.value);
      if (fb.type === "success") {
        return { type: "success", value: fb.value };
      }

      if (fb.type === "error") {
        return { type: "error", error: fb.error };
      }

      if (fb.type === "loading") {
        return { type: "loading" };
      }
    }

    if (fa.type === "error") {
      return { type: "error", error: fa.error };
    }

    return { type: "loading" };
  };
