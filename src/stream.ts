import { memoize_, none, noop, Option, some } from "./utils";

export interface Stream<out O> {
  getValue: () => O;
  subscribe: (cb: (value: O) => void) => () => void;
}

export const mkStream = <T>(
  initialValue: T,
  factory: (emit: (value: T) => void) => () => void
): Stream<T> => {
  let value = initialValue;
  const listeners: Array<(value: T) => void> = [];

  const emit = (_value: T): void => {
    value = _value;
    listeners.forEach((l) => l(_value));
  };

  let unsub: () => void = noop;

  return {
    getValue: () => value,
    subscribe: (cb) => {
      listeners.push(cb);
      if (listeners.length === 1) {
        unsub = factory(emit);
      }
      return () => {
        const idx = listeners.findIndex((l) => l === cb);
        if (idx > -1) {
          listeners.splice(idx, 1);
        }
        if (listeners.length === 0) {
          unsub();
          unsub = noop;
        }
      };
    },
  };
};

export const of = <A>(value: A): Stream<A> => ({
  getValue: () => value,
  subscribe: () => noop,
});

export const map =
  <A, B>(f: (a: A) => B) =>
  (fa: Stream<A>): Stream<B> => ({
    getValue: memoize_(() => f(fa.getValue()), [fa.getValue]),
    subscribe: (cb) => fa.subscribe((a) => cb(f(a))),
  });

export const ap =
  <A, B>(fab: Stream<(a: A) => B>) =>
  (fa: Stream<A>): Stream<B> => ({
    getValue: memoize_(
      () => fab.getValue()(fa.getValue()),
      [fab.getValue, fa.getValue]
    ),
    subscribe: (cb) => {
      let a: Option<A> = none;
      let ab: Option<(a: A) => B> = none;

      const emitAll = () => {
        if (a.type === "some" && ab.type === "some") {
          const av = a.value;
          const abv = ab.value;
          a = none;
          ab = none;
          cb(abv(av));
        }
      };

      const unsubA = fa.subscribe((_a) => {
        a = some(_a);
        emitAll();
      });

      const unsubAb = fab.subscribe((_ab) => {
        ab = some(_ab);
        emitAll();
      });

      return () => {
        unsubAb();
        unsubA();
      };
    },
  });

export const chain =
  <A, B>(f: (a: A) => Stream<B>) =>
  (fa: Stream<A>): Stream<B> => {
    return {
      getValue: memoize_(() => {
        return f(fa.getValue()).getValue();
      }, [fa.getValue]),
      subscribe: (cb) => {
        return fa.subscribe((a) => f(a).subscribe((b) => cb(b)));
      },
    };
  };
