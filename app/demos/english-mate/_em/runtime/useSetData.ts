"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useSetData<T extends Record<string, unknown>>(initial: T) {
  const [data, setState] = useState<T>(initial);
  const ref = useRef<T>(initial);

  useEffect(() => {
    ref.current = data;
  }, [data]);

  const setData = useCallback((patch: Partial<T> | ((prev: T) => Partial<T>)) => {
    setState((prev) => {
      const nextPatch = typeof patch === "function" ? patch(prev) : patch;
      const merged = { ...prev, ...nextPatch };
      ref.current = merged;
      return merged;
    });
  }, []);

  return [data, setData, ref] as const;
}
