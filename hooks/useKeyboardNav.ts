import { useCallback, useRef } from 'react';

/**
 * Arrow-key navigation for lists, menus, and grids.
 *
 * Usage:
 *   const { getItemProps } = useKeyboardNav({ count: items.length });
 *   items.map((item, i) => <div {...getItemProps(i)}>{item}</div>)
 */
export function useKeyboardNav({
  count,
  orientation = 'vertical',
  loop = true,
  onSelect,
}: {
  count: number;
  orientation?: 'vertical' | 'horizontal';
  loop?: boolean;
  onSelect?: (index: number) => void;
}) {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  const focusAt = useCallback(
    (index: number) => {
      let next = index;
      if (loop) {
        next = (index + count) % count;
      } else {
        next = Math.max(0, Math.min(count - 1, index));
      }
      itemsRef.current[next]?.focus();
    },
    [count, loop]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        itemsRef.current[index] = el;
      },
      tabIndex: index === 0 ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent) => {
        const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
        const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

        if (e.key === nextKey) {
          e.preventDefault();
          // Update tabIndex
          itemsRef.current[index]!.tabIndex = -1;
          const nextIdx = loop ? (index + 1) % count : Math.min(index + 1, count - 1);
          if (itemsRef.current[nextIdx]) itemsRef.current[nextIdx]!.tabIndex = 0;
          focusAt(index + 1);
        } else if (e.key === prevKey) {
          e.preventDefault();
          itemsRef.current[index]!.tabIndex = -1;
          const prevIdx = loop ? (index - 1 + count) % count : Math.max(index - 1, 0);
          if (itemsRef.current[prevIdx]) itemsRef.current[prevIdx]!.tabIndex = 0;
          focusAt(index - 1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          focusAt(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          focusAt(count - 1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(index);
        }
      },
    }),
    [count, orientation, loop, focusAt, onSelect]
  );

  return { getItemProps, itemsRef };
}
