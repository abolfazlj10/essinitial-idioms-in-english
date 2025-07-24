
import { useRef, useEffect, useCallback } from 'react';

interface ScrollFadeOptions {
  fadeTopClass?: string;
  fadeBottomClass?: string;
}

export const useScrollFade = (options?: ScrollFadeOptions) => {
  const { fadeTopClass = 'fade-top', fadeBottomClass = 'fade-bottom' } = options || {};
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const { scrollTop, scrollHeight, clientHeight } = node;

    const isScrolledToBottom = scrollHeight - (scrollTop + clientHeight) < 1;

    node.classList.toggle(fadeTopClass, scrollTop > 10);
    node.classList.toggle(fadeBottomClass, !isScrolledToBottom);

  }, [fadeTopClass, fadeBottomClass]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    node.addEventListener('scroll', checkScrollState);

    const resizeObserver = new ResizeObserver(checkScrollState);
    resizeObserver.observe(node);

    checkScrollState();

    return () => {
      node.removeEventListener('scroll', checkScrollState);
      resizeObserver.disconnect();
    };
  }, [checkScrollState]);

  return scrollRef;
};