export type ExhibitorPopupAnchor = "left" | "right";

export type ExhibitorPopupLayoutLite = {
  anchor: ExhibitorPopupAnchor;
  offset: [number, number];
};

export type ExhibitorPopupVisibilityInput = {
  location: { id: string } | null;
  isLargeScreen: boolean;
  layout: ExhibitorPopupLayoutLite | null;
};

export const shouldShowExhibitorPopup = ({
  location,
  isLargeScreen,
  layout,
}: ExhibitorPopupVisibilityInput): boolean =>
  Boolean(location && isLargeScreen && layout);

export type ExhibitorPopupLayoutTransitionInput = {
  prevLayout: ExhibitorPopupLayoutLite | null;
  nextLayout: ExhibitorPopupLayoutLite | null;
  hasSelection: boolean;
};

export const resolveExhibitorPopupLayoutTransition = ({
  prevLayout,
  nextLayout,
  hasSelection,
}: ExhibitorPopupLayoutTransitionInput): ExhibitorPopupLayoutLite | null => {
  if (!hasSelection) {
    return null;
  }

  if (nextLayout) {
    return nextLayout;
  }

  return prevLayout;
};
