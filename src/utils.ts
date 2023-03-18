export type Option<T> =
  | { readonly type: "some"; readonly value: T }
  | { readonly type: "none" };

export const some = <T>(value: T) => ({ type: "some", value } as const);

export const none = { type: "none" } as const;

export const noop = () => {};

export const identity = <A>(a: A) => a;

export const memoize = <A, R>(f: (a: A) => R): ((a: A) => R) => {
  const fn: ((a: A) => R) & { _cache: Option<{ a: A; r: R }> } = (a: A): R => {
    if (fn._cache.type === "some" && fn._cache.value.a === a) {
      return fn._cache.value.r;
    }
    const r = f(a);

    fn._cache = { type: "some", value: { a, r } };

    return r;
  };

  fn._cache = none;

  return fn;
};

export const memoize_ = <R>(
  f: () => R,
  dependencies: Array<() => unknown>
): (() => R) => {
  const fn: (() => R) & {
    _cache: Option<{ a: Array<unknown>; r: R }>;
  } = (): R => {
    const a = dependencies.map((d) => d());
    if (
      fn._cache.type === "some" &&
      fn._cache.value.a.every((v, idx) => v === a[idx])
    ) {
      return fn._cache.value.r;
    }
    const r = f();

    fn._cache = { type: "some", value: { a, r } };

    return r;
  };

  fn._cache = none;

  return fn;
};
