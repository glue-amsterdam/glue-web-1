import BigButton from "@/components/big-button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useLayoutEffect } from "react"


const DESCRIPTION_COLLAPSED_MAX_PX = 204;

type Props = {
    citizenId: string;
    descriptionHtml: string;
}

export default function CreativeCitizensDescription({
    citizenId,
    descriptionHtml,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showToggle, setShowToggle] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const descriptionId = `citizen-description-${citizenId}`;

    useEffect(() => {
        setIsExpanded(false);
    }, [citizenId]);

    useLayoutEffect(() => {
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
    }, [descriptionHtml, citizenId]);

    const handleToggleExpanded = () => {
        setIsExpanded((previous) => !previous);
    };

    const descriptionClassName = isExpanded
        ? "overflow-y-auto"
        : "overflow-hidden";


    return (
        <div className="pt-[15px]">
            <p
                id={descriptionId}
                ref={contentRef}
                data-citizen-description
                className={cn(descriptionClassName, "text-[15px] lg:text-[19px] lg:leading-[25px] leading-[21px]")}
                style={
                    isExpanded
                        ? undefined
                        : { maxHeight: DESCRIPTION_COLLAPSED_MAX_PX }
                }
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
            {showToggle && (
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
