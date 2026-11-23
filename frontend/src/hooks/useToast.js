import { useCallback, useEffect, useRef, useState } from "react";

export default function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (type, message) => {
      clearTimeout(timer.current);
      setToast({ id: Date.now(), type, message });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return {
    toast,
    hide,
    showSuccess: (message) => show("success", message),
    showError: (message) => show("error", message),
  };
}
