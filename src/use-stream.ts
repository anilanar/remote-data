import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import * as S from "./stream";

export const useStream = <A>(stream: S.Stream<A>) => {
  const getSnapshot = useCallback(() => {
    return stream.getValue();
  }, [stream]);

  const subscribe = useCallback(
    (cb: () => void) => {
      return stream.subscribe(() => {
        cb();
      });
    },
    [stream]
  );
  const result = useSyncExternalStore(subscribe, getSnapshot);

  const ref = useRef(result);

  useEffect(() => {
    if (result !== ref.current) {
      ref.current = result;
    }
  }, [result]);

  return result;
};
