import { useEffect, useState } from "react";

/**
 * Holds a value steady until it stops changing for `delay` ms. Used to keep
 * search inputs from firing a request per keystroke.
 */
export const useDebouncedValue = <T,>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};
