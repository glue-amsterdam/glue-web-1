import BigButton from "@/components/big-button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useLayoutEffect } from "react"


const DESCRIPTION_COLLAPSED_MAX_PX = 204;

type Props = {
    citizenId: string;
    descriptionHtml: string;
    showReadMore?: boolean;
}

export default function CreativeCitizensDescription({
    citizenId,
    descriptionHtml,
    showReadMore = true,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showToggle, setShowToggle] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const descriptionId = `citizen-description-${citizenId}`;

    useEffect(() => {
        setIsExpanded(false);
    }, [citizenId]);

    useLayoutEffect(() => {
        if (!showReadMore) {
            return;
        }

        const element = contentRef.current;
        if (!element) {
            return;
        }

        const updateShowToggle = () => {
            setShowToggle(element.scrollHeight > DESCRIPTION_COLLAPSED_MAX_PX + 1);
        };

        updateShowToggle();

        const resizeObserver = new ResizeObserver(updateShowToggle);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [descriptionHtml, citizenId, showReadMore]);

    const handleToggleExpanded = () => {
        setIsExpanded((previous) => !previous);
    };

    const descriptionClassName = showReadMore
        ? isExpanded
            ? "overflow-y-auto"
            : "overflow-hidden"
        : undefined;

    return (
        <div className="pt-[15px]">
            <div
                id={descriptionId}
                ref={contentRef}
                data-citizen-description
                className={cn(descriptionClassName, "post-content body-text")}
                style={
                    showReadMore && !isExpanded
                        ? { maxHeight: DESCRIPTION_COLLAPSED_MAX_PX }
                        : undefined
                }
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
            {showReadMore && showToggle && (
                <div className="flex justify-center pt-[15px] lg:pt-[30px]">
                    <BigButton
                        label={isExpanded ? "read less" : "read more"}
                        onClick={handleToggleExpanded}
                        mode="footer"
                        as="button"
                        fontSize="small"
                    />
                </div>
            )}
        </div>
    );
};
