export const SELECTED_ROUTE_LINE_DASHARRAY = [8, 4] as const;

export const SELECTED_ROUTE_LINE_WIDTH = {
  mobile: 2,
  desktop: 4,
} as const;

export const buildSelectedRouteLinePaint = ({
  color,
  isLargeScreen,
}: {
  color: string;
  isLargeScreen: boolean;
}) => ({
  "line-color": color,
  "line-width": isLargeScreen
    ? SELECTED_ROUTE_LINE_WIDTH.desktop
    : SELECTED_ROUTE_LINE_WIDTH.mobile,
  "line-dasharray": [...SELECTED_ROUTE_LINE_DASHARRAY],
});
