import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useResizeObserver = (callback, delay = 100) => {
  useEffect(() => {
    let timeoutId;
    
    const debouncedCallback = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };

    window.addEventListener('resize', debouncedCallback);
    
    return () => {
      window.removeEventListener('resize', debouncedCallback);
      clearTimeout(timeoutId);
    };
  }, [callback, delay]);
};

export default useDebounce; 