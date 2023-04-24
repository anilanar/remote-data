import * as IO from "fp-ts/IO";
import { Monad1 } from "fp-ts/Monad";
import { Chain1 } from "fp-ts/lib/Chain";

export const URI = "Stream";
export type URI = typeof URI;

declare module "fp-ts/HKT" {
  interface URItoKind<A> {
    readonly [URI]: Stream<A>;
  }
}

type IO<A> = IO.IO<A>;

export type Stream<A> = IO<{
  readonly getValue: IO<A>;
  readonly subscribe: (
    cb: (value: A) => IO<void>
  ) => IO<{ unsubscribe: IO<void> }>;
  readonly destroy: IO<void>;
}>;

const _map: Monad1<URI>["map"] = (fa, f) => {
  return () => {
    const old = fa();
    let value = f(old.getValue());

    return {
      getValue: () => value,
      subscribe: (cb) => () => {
        const notify = () => {
          cb(value)();
        };

        const unsub = old.subscribe((a) => () => {
          value = f(a);
          notify();
        })();

        return unsub;
      },
      destroy: old.destroy,
    };
  };
};

const _ap: Monad1<URI>["ap"] = <A, B>(
  fab: Stream<(a: A) => B>,
  fa: Stream<A>
) => {
  return () => {
    const oldFab = fab();
    const oldFa = fa();
    let value = oldFab.getValue()(oldFa.getValue());

    return {
      getValue: (): B => value,
      subscribe: (cb: (value: B) => IO<void>) => {
        return () => {
          let f = oldFab.getValue();
          let a = oldFa.getValue();

          const notify: IO<void> = () => {
            value = f(a);
            cb(value)();
          };

          const { unsubscribe: unsubFab } = oldFab.subscribe((_f) => () => {
            f = _f;
            notify();
          })();

          const { unsubscribe: unsubFa } = oldFa.subscribe((_a) => () => {
            a = _a;
            notify();
          })();

          return {
            unsubscribe: () => {
              unsubFa();
              unsubFab();
            },
          };
        };
      },
      destroy: () => {
        oldFa.destroy();
        oldFab.destroy();
      },
    };
  };
};

const chain_: Chain1<URI>["chain"] = <A, B>(
  fa: Stream<A>,
  f: (a: A) => Stream<B>
) => {
  return () => {
    const old = fa();
    let subStream = f(old.getValue())();
    let value = subStream.getValue();
    const listeners = new Set<(b: B) => IO<void>>();

    const notify = () => {
      listeners.forEach((cb) => {
        cb(value)();
      });
    };

    let { unsubscribe: unsubSub } = subStream.subscribe((b) => () => {})();

    const resub = (a: A) => () => {
      unsubSub();
      subStream.destroy();
      subStream = f(a)();
      value = subStream.getValue();
      notify();
      unsubSub = subStream.subscribe((b) => () => {
        value = b;
        notify();
      })().unsubscribe;
    };

    const { unsubscribe: unsubOld } = old.subscribe(resub)();

    return {
      getValue: (): B => value,
      subscribe: (cb: (b: B) => IO<void>) => () => {
        listeners.add(cb);
        return {
          unsubscribe: () => {
            listeners.delete(cb);
          },
        };
      },
      destroy: () => {
        unsubOld();
        old.destroy();

        unsubSub();
        subStream.destroy();
      },
    };
  };
};

export const map: <A, B>(f: (a: A) => B) => (fa: Stream<A>) => Stream<B> =
  (f) => (fa) =>
    _map(fa, f);

export const ap: <A, B>(
  fab: Stream<(a: A) => B>
) => (fa: Stream<A>) => Stream<B> = (fab) => (fa) => _ap(fab, fa);

export const of = <A>(a: A): Stream<A> =>
  IO.of({
    getValue: IO.of(a),
    subscribe: IO.of(IO.of({ unsubscribe: IO.of<void>(undefined) })),
    destroy: IO.of<void>(undefined),
  });

export const chain: <A, B>(
  f: (a: A) => Stream<B>
) => (fa: Stream<A>) => Stream<B> = (f) => (fa) => chain_(fa, f);

export const mkStream = <A>(
  getValue: IO<A>,
  subscribe: (cb: (a: A) => IO<void>) => IO<{ unsubscribe: IO<void> }>
): Stream<A> => {
  return () => {
    let value: A = getValue();
    const listeners = new Set<(a: A) => IO<void>>();

    const { unsubscribe } = subscribe((newValue) => () => {
      value = newValue;
      listeners.forEach((cb) => cb(newValue)());
    })();

    return {
      getValue: () => value,
      subscribe: (cb: (value: A) => IO<void>) => {
        return () => {
          listeners.add(cb);
          return {
            unsubscribe: () => {
              listeners.delete(cb);
            },
          };
        };
      },
      destroy: () => {
        listeners.clear();
        unsubscribe();
      },
    };
  };
};
