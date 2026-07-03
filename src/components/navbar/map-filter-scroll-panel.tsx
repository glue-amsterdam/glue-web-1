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

export type SheetHeightMode = "rising-sheet" | "full-natural";

const PEEK_FRACTION = 1 / 3;
const MIN_PEEK_PX = 120;
const PAN_START_THRESHOLD_PX = 8;
const SWIPE_CLOSE_THRESHOLD_PX = 40;

type MapFilterScrollPanelProps = {
    isOpen: boolean;
    panelId: string;
    ariaLabel: string;
    heightMode?: SheetHeightMode;
    anchorRef?: RefObject<HTMLElement | null>;
    /** Extra bottom offset (px) to stack above another sheet (e.g. category picker). */
    stackOffset?: number;
    className?: string;
    /** Higher z-index for stacked overlays (default 45). */
    zIndex?: number;
    /** Called when user swipes down while the sheet is at peek (collapsed). */
    onSwipeDownAtPeek?: () => void;
    children: ReactNode;
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

type RisingMetrics = {
    availableSpace: number;
    peekHeight: number;
    maxExpand: number;
    effectiveMaxHeight: number;
};

type PanGestureState = {
    pointerId: number;
    startX: number;
    startY: number;
    lastY: number;
    isPanning: boolean;
};

const getFallbackAnchorTop = (): number => {
    if (typeof document === "undefined") return 105;
    const root = document.documentElement;
    const mobileTotal = getComputedStyle(root)
        .getPropertyValue("--nav-total-h-mobile")
        .trim();
    const parsed = Number.parseFloat(mobileTotal);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 105;
};

export const MapFilterScrollPanel = ({
    isOpen,
    panelId,
    ariaLabel,
    heightMode = "rising-sheet",
    anchorRef,
    stackOffset = 0,
    className,
    zIndex = 45,
    onSwipeDownAtPeek,
    children,
}: MapFilterScrollPanelProps) => {
    const isRisingSheet = heightMode === "rising-sheet";
    const panelRef = useRef<HTMLDivElement>(null);
    const contentInnerRef = useRef<HTMLDivElement>(null);
    const expandOffsetRef = useRef(0);
    const contentScrollOffsetRef = useRef(0);
    const contentHeightRef = useRef(0);
    const peekSwipeDownAccumRef = useRef(0);
    const panGestureRef = useRef<PanGestureState | null>(null);
    const suppressClickRef = useRef(false);
    const onSwipeDownAtPeekRef = useRef(onSwipeDownAtPeek);
    const metricsRef = useRef<RisingMetrics>({
        availableSpace: 0,
        peekHeight: 0,
        maxExpand: 0,
        effectiveMaxHeight: 0,
    });

    const [anchorTop, setAnchorTop] = useState(getFallbackAnchorTop);
    const [contentHeight, setContentHeight] = useState(0);
    const [expandOffset, setExpandOffset] = useState(0);
    const [contentScrollOffset, setContentScrollOffset] = useState(0);
    const bottomInset = useMapBottomInset(isOpen);

    useEffect(() => {
        onSwipeDownAtPeekRef.current = onSwipeDownAtPeek;
    }, [onSwipeDownAtPeek]);

    const measureNavbarAnchor = useCallback(() => {
        const anchor = anchorRef?.current;
        if (anchor) {
            setAnchorTop(anchor.getBoundingClientRect().top);
            return;
        }
        setAnchorTop(getFallbackAnchorTop());
    }, [anchorRef]);

    const measureContentHeight = useCallback(() => {
        const content = contentInnerRef.current;
        if (!content) return;
        const nextHeight = content.scrollHeight;
        contentHeightRef.current = nextHeight;
        setContentHeight(nextHeight);
    }, []);

    const computeRisingMetrics = useCallback(
        (measuredContentHeight = contentHeightRef.current): RisingMetrics => {
            const viewportBottom = window.innerHeight - bottomInset - stackOffset;
            const availableSpace = Math.max(0, viewportBottom - anchorTop);

            if (!isRisingSheet || availableSpace <= 0) {
                return {
                    availableSpace,
                    peekHeight: 0,
                    maxExpand: 0,
                    effectiveMaxHeight: availableSpace,
                };
            }

            const contentCap =
                measuredContentHeight > 0
                    ? measuredContentHeight
                    : availableSpace;
            const effectiveMaxHeight = Math.min(availableSpace, contentCap);

            const peekHeight = Math.min(
                effectiveMaxHeight,
                Math.max(MIN_PEEK_PX, availableSpace * PEEK_FRACTION)
            );
            const maxExpand = Math.max(0, effectiveMaxHeight - peekHeight);

            return {
                availableSpace,
                peekHeight,
                maxExpand,
                effectiveMaxHeight,
            };
        },
        [anchorTop, bottomInset, isRisingSheet, stackOffset]
    );

    const refreshMetrics = useCallback(() => {
        measureContentHeight();
        metricsRef.current = computeRisingMetrics(contentHeightRef.current);
    }, [computeRisingMetrics, measureContentHeight]);

    const isAtPeek = useCallback(() => {
        return (
            expandOffsetRef.current <= 0.5 &&
            contentScrollOffsetRef.current <= 0.5
        );
    }, []);

    const getShellHeight = useCallback(() => {
        const metrics = metricsRef.current;
        const height = contentHeightRef.current;

        if (height > 0 && height <= metrics.peekHeight) {
            return height;
        }

        return Math.min(
            metrics.effectiveMaxHeight,
            metrics.peekHeight + expandOffsetRef.current
        );
    }, []);

    const applyPanDelta = useCallback(
        (deltaY: number) => {
            if (!isRisingSheet || deltaY === 0) return false;

            const metrics = metricsRef.current;
            const { maxExpand } = metrics;
            const height = contentHeightRef.current;

            if (height <= 0) return false;

            const shellHeight = getShellHeight();
            const contentScrollMax = Math.max(0, height - shellHeight);

            if (maxExpand <= 0 && contentScrollMax <= 0) return false;

            const atMaxExpand = expandOffsetRef.current >= maxExpand - 0.5;

            let consumed = false;

            if (deltaY > 0) {
                const upward = deltaY;

                if (!atMaxExpand) {
                    const prev = expandOffsetRef.current;
                    const next = clamp(prev + upward, 0, maxExpand);
                    if (next !== prev) {
                        expandOffsetRef.current = next;
                        setExpandOffset(next);
                        consumed = true;
                    }
                } else if (contentScrollOffsetRef.current < contentScrollMax) {
                    const prev = contentScrollOffsetRef.current;
                    const next = clamp(prev + upward, 0, contentScrollMax);
                    if (next !== prev) {
                        contentScrollOffsetRef.current = next;
                        setContentScrollOffset(next);
                        consumed = true;
                    }
                }
            } else {
                const downward = -deltaY;

                if (contentScrollOffsetRef.current > 0) {
                    const prev = contentScrollOffsetRef.current;
                    const next = clamp(prev - downward, 0, contentScrollMax);
                    if (next !== prev) {
                        contentScrollOffsetRef.current = next;
                        setContentScrollOffset(next);
                        consumed = true;
                    }
                } else if (expandOffsetRef.current > 0) {
                    const prev = expandOffsetRef.current;
                    const next = clamp(prev - downward, 0, maxExpand);
                    if (next !== prev) {
                        expandOffsetRef.current = next;
                        setExpandOffset(next);
                        consumed = true;
                    }
                }
            }

            return consumed;
        },
        [getShellHeight, isRisingSheet]
    );

    const applyPanDeltaWithClose = useCallback(
        (deltaY: number) => {
            const consumed = applyPanDelta(deltaY);

            if (consumed) {
                peekSwipeDownAccumRef.current = 0;
                return true;
            }

            if (deltaY < 0 && isAtPeek()) {
                peekSwipeDownAccumRef.current += -deltaY;

                if (
                    peekSwipeDownAccumRef.current >= SWIPE_CLOSE_THRESHOLD_PX &&
                    onSwipeDownAtPeekRef.current
                ) {
                    peekSwipeDownAccumRef.current = 0;
                    onSwipeDownAtPeekRef.current();
                    return true;
                }

                return true;
            }

            peekSwipeDownAccumRef.current = 0;
            return consumed;
        },
        [applyPanDelta, isAtPeek]
    );

    useLayoutEffect(() => {
        if (!isOpen) return;
        measureNavbarAnchor();
        window.addEventListener("resize", measureNavbarAnchor);
        return () => window.removeEventListener("resize", measureNavbarAnchor);
    }, [isOpen, measureNavbarAnchor]);

    useLayoutEffect(() => {
        if (!isOpen) {
            setContentHeight(0);
            contentHeightRef.current = 0;
            return;
        }

        expandOffsetRef.current = 0;
        contentScrollOffsetRef.current = 0;
        peekSwipeDownAccumRef.current = 0;
        setExpandOffset(0);
        setContentScrollOffset(0);
        measureContentHeight();
    }, [isOpen, measureContentHeight, children, heightMode]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        metricsRef.current = computeRisingMetrics(contentHeightRef.current);
    }, [
        isOpen,
        anchorTop,
        bottomInset,
        stackOffset,
        contentHeight,
        computeRisingMetrics,
    ]);

    useEffect(() => {
        if (!isOpen || !isRisingSheet) return;

        document.body.style.overflow = "hidden";

        const panel = panelRef.current;
        if (!panel) {
            return () => {
                document.body.style.overflow = "";
            };
        }

        const handleWheel = (event: WheelEvent) => {
            refreshMetrics();
            const consumed = applyPanDeltaWithClose(-event.deltaY);
            if (consumed) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        const handlePointerDown = (event: PointerEvent) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;

            panGestureRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                lastY: event.clientY,
                isPanning: false,
            };
        };

        const handlePointerMove = (event: PointerEvent) => {
            const gesture = panGestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;

            const totalDeltaY = gesture.startY - event.clientY;
            const stepDeltaY = gesture.lastY - event.clientY;
            gesture.lastY = event.clientY;

            if (!gesture.isPanning) {
                const totalDeltaX = event.clientX - gesture.startX;
                if (
                    Math.abs(totalDeltaY) >= PAN_START_THRESHOLD_PX &&
                    Math.abs(totalDeltaY) > Math.abs(totalDeltaX)
                ) {
                    gesture.isPanning = true;
                    panel.setPointerCapture(event.pointerId);
                } else {
                    return;
                }
            }

            refreshMetrics();
            applyPanDeltaWithClose(stepDeltaY);
            event.preventDefault();
        };

        const handlePointerUp = (event: PointerEvent) => {
            const gesture = panGestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;

            if (gesture.isPanning) {
                suppressClickRef.current = true;
                window.setTimeout(() => {
                    suppressClickRef.current = false;
                }, 300);
            }

            peekSwipeDownAccumRef.current = 0;
            panGestureRef.current = null;

            if (panel.hasPointerCapture(event.pointerId)) {
                panel.releasePointerCapture(event.pointerId);
            }
        };

        const handlePointerCancel = (event: PointerEvent) => {
            handlePointerUp(event);
        };

        const handleClickCapture = (event: MouseEvent) => {
            if (!suppressClickRef.current) return;
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
        };

        const resizeObserver = contentInnerRef.current
            ? new ResizeObserver(refreshMetrics)
            : null;
        if (contentInnerRef.current) {
            resizeObserver?.observe(contentInnerRef.current);
        }

        panel.addEventListener("wheel", handleWheel, { passive: false });
        panel.addEventListener("pointerdown", handlePointerDown);
        panel.addEventListener("pointermove", handlePointerMove);
        panel.addEventListener("pointerup", handlePointerUp);
        panel.addEventListener("pointercancel", handlePointerCancel);
        panel.addEventListener("click", handleClickCapture, true);
        window.addEventListener("resize", refreshMetrics);

        return () => {
            document.body.style.overflow = "";
            resizeObserver?.disconnect();
            panel.removeEventListener("wheel", handleWheel);
            panel.removeEventListener("pointerdown", handlePointerDown);
            panel.removeEventListener("pointermove", handlePointerMove);
            panel.removeEventListener("pointerup", handlePointerUp);
            panel.removeEventListener("pointercancel", handlePointerCancel);
            panel.removeEventListener("click", handleClickCapture, true);
            window.removeEventListener("resize", refreshMetrics);
        };
    }, [isOpen, isRisingSheet, applyPanDeltaWithClose, refreshMetrics]);

    useEffect(() => {
        if (!isOpen || isRisingSheet) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, isRisingSheet]);

    if (!isOpen || typeof document === "undefined") return null;

    const metrics = computeRisingMetrics(contentHeight);
    const panelBottom = bottomInset + stackOffset;

    const risingVisibleHeight = isRisingSheet
        ? contentHeight > 0 && contentHeight <= metrics.peekHeight
            ? contentHeight
            : Math.min(
                  metrics.effectiveMaxHeight,
                  metrics.peekHeight + expandOffset
              )
        : 0;

    const naturalFitsInViewport =
        !isRisingSheet &&
        contentHeight > 0 &&
        contentHeight <= metrics.availableSpace;
    const naturalOverflowsViewport =
        !isRisingSheet &&
        contentHeight > 0 &&
        contentHeight > metrics.availableSpace;

    const shellHeight = isRisingSheet
        ? risingVisibleHeight
        : naturalFitsInViewport
          ? contentHeight
          : naturalOverflowsViewport
            ? metrics.availableSpace
            : 0;

    const panelShellStyle = {
        position: "fixed" as const,
        left: 0,
        right: 0,
        bottom: panelBottom,
        top: "auto" as const,
        zIndex,
        touchAction: isRisingSheet ? ("none" as const) : undefined,
    };

    const panelBody = (
        <div
            className={cn(
                "flex w-full flex-col border-t lg:border-t-2 border-b lg:border-b-2 border-(--black-color) bg-(--white-color)",
                isRisingSheet && "overflow-hidden",
                naturalOverflowsViewport &&
                    "overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
            )}
            style={{
                height: shellHeight > 0 ? shellHeight : undefined,
                maxHeight:
                    metrics.availableSpace > 0
                        ? metrics.availableSpace
                        : undefined,
            }}
        >
            <div
                ref={contentInnerRef}
                className={cn("w-full shrink-0", className)}
                style={
                    isRisingSheet
                        ? {
                              transform: `translateY(-${contentScrollOffset}px)`,
                          }
                        : undefined
                }
            >
                {children}
            </div>
        </div>
    );

    return createPortal(
        <div
            id={panelId}
            ref={panelRef}
            role="group"
            aria-label={ariaLabel}
            style={panelShellStyle}
        >
            <MainContainer>{panelBody}</MainContainer>
        </div>,
        document.body
    );
};
