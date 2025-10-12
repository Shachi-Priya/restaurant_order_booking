import { useEffect, useState } from 'react';

/**
 * Slide switch for a single order.
 * - Green when ON, red when OFF
 * - Persists locally (localStorage), no DB calls
 */
export default function OrderSlideSwitch({ orderId, defaultOn = false }) {
  const storageKey = `orderSlide:${orderId}`;
  const [on, setOn] = useState(defaultOn);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'on') setOn(true);
    else if (saved === 'off') setOn(false);
    else setOn(defaultOn);
    setHydrated(true);
  }, [storageKey, defaultOn]);

  const toggle = () => {
    setOn((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, next ? 'on' : 'off');
      }
      return next;
    });
  };

  if (!hydrated) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`order-switch ${
        on ? 'order-switch--on' : 'order-switch--off'
      }`}
      aria-pressed={on}
      aria-label={on ? 'Marked as completed' : 'Marked as not completed'}
      title={on ? 'Completed' : 'Not completed'}
    >
      <span className="order-switch__thumb" />
    </button>
  );
}
