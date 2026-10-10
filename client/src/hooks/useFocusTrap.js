import { useEffect } from 'react';

// Keeps Tab and Shift+Tab inside the open dialog while `active` is true.
export default function useFocusTrap(active) {
  useEffect(() => {
    if (!active) return undefined;

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return;

      const items = dialog.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (!dialog.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
