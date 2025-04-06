import { useEffect, useState } from "react";

export const useStoredState = <T>(
  key: string,
  defaultValue?: T,
  storage: Storage = localStorage,
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => {
    const value = storage.getItem(key);
    const valueFound = value && value !== "undefined";
    return valueFound ? JSON.parse(value) : defaultValue;
  });

  useEffect(() => {
    if (!state) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, storage]);

  return [state, setState];
};
