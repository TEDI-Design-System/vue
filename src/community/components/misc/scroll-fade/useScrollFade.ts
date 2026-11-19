import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue';

export interface UseScrollFadeOptions {
  /** Called when the scroll position reaches the top, including on mount when it starts there. */
  onScrollToTop?: () => void;
  /** Called when the scroll position reaches the bottom, including on mount when the content fits. */
  onScrollToBottom?: () => void;
}

export interface UseScrollFadeReturn {
  /** Content is hidden above the visible area. */
  canScrollUp: Readonly<Ref<boolean>>;
  /** Content is hidden below the visible area. */
  canScrollDown: Readonly<Ref<boolean>>;
  /** Re-measures the scroller. Bind it to the scroller's `scroll` event. */
  update: () => void;
}

// Zoomed and high-DPI screens scroll in fractions of a pixel, so the edges are never hit exactly.
const EDGE_TOLERANCE = 1;

/**
 * Tracks whether a vertical scroller has content hidden above or below it.
 *
 * @param scroller The element that scrolls.
 * @param content A wrapper around the scroller's content. A scroller capped with `max-height` keeps its
 * size when content is added or removed, so only the wrapper's size reveals the change.
 */
export const useScrollFade = (
  scroller: Readonly<Ref<HTMLElement | null>>,
  content: Readonly<Ref<HTMLElement | null>>,
  { onScrollToTop, onScrollToBottom }: UseScrollFadeOptions = {},
): UseScrollFadeReturn => {
  const canScrollUp: Ref<boolean> = ref(false);
  const canScrollDown: Ref<boolean> = ref(false);

  // Remembered so the callbacks fire once on reaching an edge, not on every scroll event there.
  let wasAtTop = false;
  let wasAtBottom = false;
  let resizeObserver: ResizeObserver | undefined;

  const update = (): void => {
    const element = scroller.value;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const atTop = scrollTop <= EDGE_TOLERANCE;
    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= EDGE_TOLERANCE;

    canScrollUp.value = !atTop;
    canScrollDown.value = !atBottom;

    if (atTop && !wasAtTop) onScrollToTop?.();
    if (atBottom && !wasAtBottom) onScrollToBottom?.();

    wasAtTop = atTop;
    wasAtBottom = atBottom;
  };

  onMounted(() => {
    update();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(update);
    [scroller.value, content.value]
      .filter((element): element is HTMLElement => element !== null)
      .forEach((element) => observer.observe(element));
    resizeObserver = observer;
  });

  onBeforeUnmount(() => resizeObserver?.disconnect());

  return { canScrollUp: readonly(canScrollUp), canScrollDown: readonly(canScrollDown), update };
};
