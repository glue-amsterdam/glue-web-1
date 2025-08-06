import { useState, useCallback } from "react";

export const useOverlayState = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openOverlay = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleOverlay = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    setIsOpen,
    openOverlay,
    closeOverlay,
    toggleOverlay,
  };
};
