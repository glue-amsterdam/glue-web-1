import { RoutePrintSheet } from "@/components/map/route-print-sheet";
import { RoutePrintTemplate } from "@/components/map/route-print-template";
import type { RoutePrintProps } from "@/lib/map/route-print-props";
import { buildRoutePrintPages } from "@/lib/map/route-print-pages";

type RoutePrintDocumentProps = RoutePrintProps & {
  /** Extra class on each A4 sheet (e.g. preview shadow). */
  sheetClassName?: string;
};

/**
 * One or more A4 sheets: page 1 = map + 4×5; further pages = header/footer + 4×5.
 */
export const RoutePrintDocument = ({
  sheetClassName,
  ...printProps
}: RoutePrintDocumentProps) => {
  const pages = buildRoutePrintPages(printProps.stops);

  return (
    <>
      {pages.map((page, index) => (
        <RoutePrintSheet
          key={`${page.kind}-${index}`}
          className={[
            sheetClassName,
            index < pages.length - 1 ? "break-after-page" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <RoutePrintTemplate
            {...printProps}
            stops={page.stops}
            variant={page.kind}
          />
        </RoutePrintSheet>
      ))}
    </>
  );
};
