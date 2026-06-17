"use client";

import { createPortal } from "react-dom";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react";

import MainContainer from "@/components/main-container";
import { useMapBottomInset } from "@/lib/map/map-viewport-insets";
import { cn } from "@/lib/utils";

export type MapFilterPanelPlacement =
    | "below-navbar"
    | "below-map"
    /** Bottom-anchored sheet with wheel/touch expand (peek fraction of height). */
    | "bottom-sheet";

/** Collapsed peek for tall lists (~matches prior translate-y-2/3). */
const BOTTOM_SHEET_PEEK_VISIBLE_RATIO = 1 / 3;
const BOTTOM_SHEET_MIN_PEEK_PX = 120;

type MapFilterScrollPanelProps = {
    isOpen: boolean;
    panelId: string;
    ariaLabel: string;
    placement?: MapFilterPanelPlacement;
    anchorRef?: RefObject<HTMLElement | null>;
    /** @deprecated Prefer `bottom-sheet` placement. Extra vertical offset as % of panel height. */
    anchorOffsetPercent?: number;
    className?: string;
    children: ReactNode;
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export const MapFilterScrollPanel = ({
    isOpen,
    panelId,
    ariaLabel,
    placement = "below-navbar",
    anchorRef,
    anchorOffsetPercent = 0,
    className,
    children,
}: MapFilterScrollPanelProps) => {
    const isBelowMap = placement === "below-map";
    const isBottomSheet = placement === "bottom-sheet";
    const usesExpandScroll = !isBelowMap;
    const panelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const scrollOffsetRef = useRef(0);
    const maxScrollRef = useRef(0);
    const touchStartYRef = useRef(0);
    const [anchorTop, setAnchorTop] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const bottomInset = useMapBottomInset(isOpen);

    const measureNavbarAnchor = useCallback(() => {
        const anchor = anchorRef?.current;
        if (!anchor) return;
        setAnchorTop(anchor.getBoundingClientRect().top);
    }, [anchorRef]);

    const measureContentHeight = useCallback(() => {
        const content = contentRef.current;
        if (!content) return;
        setContentHeight(content.scrollHeight);
    }, []);

    const getBottomSheetMetrics = useCallback(
        (height: number) => {
            const viewportBottom = window.innerHeight - bottomInset;
            const availableHeight = Math.max(0, viewportBottom - anchorTop);

            if (height <= 0) {
                return { peekHeight: 0, maxScroll: 0, maxVisibleHeight: 0 };
            }

            const maxVisibleHeight = Math.min(height, availableHeight);
            const ratioPeek = height * BOTTOM_SHEET_PEEK_VISIBLE_RATIO;
            const peekHeight =
                maxVisibleHeight <= BOTTOM_SHEET_MIN_PEEK_PX ||
                height <= ratioPeek * 1.5
                    ? maxVisibleHeight
                    : Math.min(
                          maxVisibleHeight,
                          Math.max(BOTTOM_SHEET_MIN_PEEK_PX, ratioPeek)
                      );
            const maxScroll = Math.max(0, maxVisibleHeight - peekHeight);

            return { peekHeight, maxScroll, maxVisibleHeight };
        },
        [anchorTop, bottomInset]
    );

    const computeMaxScroll = useCallback(() => {
        const panel = panelRef.current;
        if (!panel) return 0;

        if (isBottomSheet) {
            const height = contentRef.current?.scrollHeight ?? contentHeight;
            return getBottomSheetMetrics(height).maxScroll;
        }

        const bottom = panel.getBoundingClientRect().bottom;
        const bottomAtZeroScroll = bottom + scrollOffsetRef.current;
        const viewportBottom = window.innerHeight - bottomInset;
        return Math.max(0, bottomAtZeroScroll - viewportBottom);
    }, [bottomInset, isBottomSheet, contentHeight, getBottomSheetMetrics]);

    const setScrollOffsetClamped = useCallback(
        (next: number | ((prev: number) => number)) => {
            setScrollOffset((prev) => {
                const resolved =
                    typeof next === "function" ? next(prev) : next;
                const clamped = clamp(resolved, 0, maxScrollRef.current);
                scrollOffsetRef.current = clamped;
                return clamped;
            });
        },
        []
    );

    useLayoutEffect(() => {
        if (!isOpen || isBelowMap) return;
        measureNavbarAnchor();
        window.addEventListener("resize", measureNavbarAnchor);
        return () => window.removeEventListener("resize", measureNavbarAnchor);
    }, [isOpen, isBelowMap, measureNavbarAnchor]);

    useLayoutEffect(() => {
        if (!isOpen || isBelowMap) {
            setContentHeight(0);
            return;
        }
        measureContentHeight();
    }, [isOpen, isBelowMap, measureContentHeight, children]);

    useLayoutEffect(() => {
        if (!isOpen || isBelowMap) {
            setScrollOffset(0);
            scrollOffsetRef.current = 0;
            return;
        }

        maxScrollRef.current = computeMaxScroll();
    }, [
        isOpen,
        isBelowMap,
        anchorTop,
        bottomInset,
        contentHeight,
        computeMaxScroll,
    ]);

    useEffect(() => {
        if (!isOpen || !usesExpandScroll) return;

        document.body.style.overflow = "hidden";

        const refreshMaxScroll = () => {
            measureContentHeight();
            maxScrollRef.current = computeMaxScroll();
            setScrollOffsetClamped(scrollOffsetRef.current);
        };

        const handleWheel = (event: WheelEvent) => {
            refreshMaxScroll();
            const max = maxScrollRef.current;
            if (max <= 0) return;

            const prev = scrollOffsetRef.current;
            const next = clamp(prev + event.deltaY, 0, max);
            if (next === prev) return;

            event.preventDefault();
            setScrollOffsetClamped(next);
        };

        const handleTouchStart = (event: TouchEvent) => {
            touchStartYRef.current = event.touches[0]?.clientY ?? 0;
        };

        const handleTouchMove = (event: TouchEvent) => {
            refreshMaxScroll();
            const max = maxScrollRef.current;
            if (max <= 0) return;

            const touchY = event.touches[0]?.clientY ?? touchStartYRef.current;
            const delta = touchStartYRef.current - touchY;
            touchStartYRef.current = touchY;

            const prev = scrollOffsetRef.current;
            const next = clamp(prev + delta, 0, max);
            if (next === prev) return;

            event.preventDefault();
            setScrollOffsetClamped(next);
        };

        const resizeObserver = contentRef.current
            ? new ResizeObserver(refreshMaxScroll)
            : null;
        if (contentRef.current) {
            resizeObserver?.observe(contentRef.current);
        }

        window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("resize", refreshMaxScroll);

        return () => {
            document.body.style.overflow = "";
            resizeObserver?.disconnect();
            window.removeEventListener("wheel", handleWheel, { capture: true });
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("resize", refreshMaxScroll);
        };
    }, [
        isOpen,
        usesExpandScroll,
        bottomInset,
        computeMaxScroll,
        setScrollOffsetClamped,
        measureContentHeight,
    ]);

    if (!isOpen || typeof document === "undefined") return null;

    const bottomSheetMetrics = isBottomSheet
        ? getBottomSheetMetrics(contentHeight)
        : { peekHeight: 0, maxScroll: 0, maxVisibleHeight: 0 };

    const bottomSheetVisibleHeight = isBottomSheet
        ? Math.min(
              bottomSheetMetrics.maxVisibleHeight,
              bottomSheetMetrics.peekHeight + scrollOffset
          )
        : 0;

    const panelTransform = isBottomSheet
        ? undefined
        : anchorOffsetPercent > 0
          ? `translateY(calc(${anchorOffsetPercent}% - ${scrollOffset}px))`
          : `translateY(${-scrollOffset}px)`;

    const belowMapMaxHeight = `calc(100dvh - var(--secondary-nav-h) - ${bottomInset}px)`;

    const panelShellStyle = isBelowMap
        ? {
              position: "fixed" as const,
              left: 0,
              right: 0,
              bottom: bottomInset,
              top: "auto" as const,
          }
        : isBottomSheet
          ? {
                position: "fixed" as const,
                left: 0,
                right: 0,
                bottom: bottomInset,
                top: "auto" as const,
            }
          : {
                position: "fixed" as const,
                left: 0,
                right: 0,
                top: anchorTop,
                transform: panelTransform,
            };

    const panelBody = (
        <div
            ref={contentRef}
            className={cn(
                "flex w-full flex-col border-t lg:border-t-2 border-[var(--black-color)] bg-[var(--white-color)]",
                usesExpandScroll && !isBottomSheet && "border-b lg:border-b-2 lg:flex-row",
                isBottomSheet && "border-b lg:border-b-2",
                isBelowMap && "overflow-y-auto border-b lg:border-b-2",
                className
            )}
            style={
                isBelowMap
                    ? { maxHeight: belowMapMaxHeight }
                    : isBottomSheet
                      ? {
                            maxHeight: bottomSheetVisibleHeight,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                        }
                      : undefined
            }
        >
            {children}
        </div>
    );

    return createPortal(
        <div
            id={panelId}
            ref={panelRef}
            role="group"
            aria-label={ariaLabel}
            className="z-45"
            style={panelShellStyle}
        >
            <MainContainer>{panelBody}</MainContainer>
        </div>,
        document.body
    );
};
