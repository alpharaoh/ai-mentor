import { useEffect, useState } from "react";

export const useStoredState = <T>(key: string, defaultValue?: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return;

    const value = localStorage.getItem(key);
    const valueFound = value && value !== "undefined";
    return valueFound ? JSON.parse(value) : defaultValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!state) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
};
