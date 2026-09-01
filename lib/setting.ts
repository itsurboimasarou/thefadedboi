import { useSyncExternalStore } from "react";

interface SettingOptions<T> {
  key: string;
  event: string;
  fallback: T;
  parse: (raw: string | null) => T;
  serialize?: (value: T) => string | null;
  apply?: (value: T) => void;
}

export interface Setting<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (onChange: () => void) => () => void;
  use: () => T;
}

export function createSetting<T>(o: SettingOptions<T>): Setting<T> {
  const get = (): T => {
    if (typeof window === "undefined") return o.fallback;
    try {
      return o.parse(localStorage.getItem(o.key));
    } catch {
      return o.fallback;
    }
  };

  const set = (value: T): void => {
    try {
      const raw = o.serialize ? o.serialize(value) : String(value);
      if (raw === null) localStorage.removeItem(o.key);
      else localStorage.setItem(o.key, raw);
    } catch {}
    o.apply?.(value);
    window.dispatchEvent(new CustomEvent(o.event, { detail: value }));
  };

  const subscribe = (onChange: () => void): (() => void) => {
    window.addEventListener(o.event, onChange);
    return () => window.removeEventListener(o.event, onChange);
  };
  const use = (): T => useSyncExternalStore(subscribe, get, () => o.fallback);

  return { get, set, subscribe, use };
}
