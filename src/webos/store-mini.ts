// Tiny zustand-like store (no dep). Subscribe + setState + getState + hook.
import { useSyncExternalStore } from "react";

type Updater<S> = Partial<S> | ((s: S) => Partial<S>);

export function create<S>(init: () => S) {
  let state = init();
  const listeners = new Set<() => void>();
  const setState = (u: Updater<S>) => {
    const next = typeof u === "function" ? (u as any)(state) : u;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };
  const getState = () => state;
  const subscribe = (l: (s: S) => void) => {
    const wrapped = () => l(state);
    listeners.add(wrapped);
    return () => listeners.delete(wrapped);
  };
  function useStore<T>(selector: (s: S) => T): T {
    return useSyncExternalStore(
      (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
      () => selector(state),
      () => selector(state),
    );
  }
  (useStore as any).setState = setState;
  (useStore as any).getState = getState;
  (useStore as any).subscribe = subscribe;
  return useStore as typeof useStore & {
    setState: typeof setState;
    getState: typeof getState;
    subscribe: typeof subscribe;
  };
}
