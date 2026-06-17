import PlusButtonMobile from "@/components/icons/plus-button-mobile";
import PlusIconDesktop from "@/components/icons/plus-icon-desktop";
import CrossRotatedMobile from "@/components/icons/cross-rotated-mobile";
import CrossRotatedDesktop from "@/components/icons/cross-rotated-desktop";

const AccordionPlusCrossIcon = () => (
  <span aria-hidden="true" className="shrink-0">
    <span className="block group-data-[state=open]:hidden">
      <span className="lg:hidden">
        <PlusButtonMobile />
      </span>
      <span className="hidden lg:block">
        <PlusIconDesktop />
      </span>
    </span>
    <span className="hidden group-data-[state=open]:block">
      <span className="lg:hidden">
        <CrossRotatedMobile />
      </span>
      <span className="hidden lg:block">
        <CrossRotatedDesktop />
      </span>
    </span>
  </span>
);

export default AccordionPlusCrossIcon;
