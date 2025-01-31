import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";

interface UseScrollIndicatorOptions {
  threshold?: number;
}

export function useScrollIndicator<T extends HTMLElement>({
  threshold = 10,
}: UseScrollIndicatorOptions = {}): {
  showScrollIndicator: boolean;
  contentRef: RefObject<T>;
  checkScroll: () => void;
} {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const contentRef = useRef<T>(null);

  const checkScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;

      // Show indicator if not at the bottom
      setShowScrollIndicator(
        scrollTop + clientHeight < scrollHeight - threshold
      );
    }
  }, [threshold]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", checkScroll);
      }
    };
  }, [checkScroll]);

  return {
    showScrollIndicator,
    contentRef,
    checkScroll,
  };
}
