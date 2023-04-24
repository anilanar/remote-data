import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as S from "./stream";

export const useStream = <A>(stream: S.Stream<A>) => {
  const [streamInternals] = useState(() => stream());

  useEffect(() => {
    () => {
      streamInternals.destroy();
    };
  }, [streamInternals]);

  const getSnapshot = useCallback(() => {
    return streamInternals.getValue();
  }, [stream]);

  const subscribe = useCallback(
    (cb: () => void) => {
      const { unsubscribe } = streamInternals.subscribe((_) => () => {
        cb();
      })();
      return unsubscribe;
    },
    [stream]
  );
  const result = useSyncExternalStore(subscribe, getSnapshot);

  return result;
};
