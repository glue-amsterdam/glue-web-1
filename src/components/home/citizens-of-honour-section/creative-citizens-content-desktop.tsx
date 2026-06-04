import { ClientCitizen } from "@/schemas/citizenSchema";
import { AnimatePresence, motion } from "framer-motion";
import CreativeCitizensImage from "./creative-citizens-image";
import CreativeCitizensTitle from "./creative-citizens-title";
import CreativeCitizensDescription from "./creative-citizens-description";
import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";


type Props = {
    description?: string
    currentCitizen: ClientCitizen | null
    hasMultiple: boolean
    currentIndex: number
    handleSelect: (index: number) => void
    citizens: ClientCitizen[]
}



const CreativeCitizensContentDesktop = ({ description, currentCitizen, hasMultiple, currentIndex, handleSelect, citizens }: Props) => {

    const citizenDescriptionHtml = useSanitizedHTML(currentCitizen?.description ?? '');
    return (
        <>
            <div className="flex w-full gap-[30px]">
                <AnimatePresence mode="wait">
                    {currentCitizen && (
                        <motion.div
                            key={currentCitizen.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className=""
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <>
                                <CreativeCitizensImage citizen={currentCitizen} />

                            </>
                        </motion.div>
                    )}
                </AnimatePresence>
                {description && (<div>
                    <p className="text-[15px] leading-[22px] lg:text-[23px] lg:leading-[29px]">{description}</p>
                    {currentCitizen && (<>
                        <CreativeCitizensTitle title={currentCitizen.name} />
                        <CreativeCitizensDescription
                            citizenId={currentCitizen.id}
                            descriptionHtml={citizenDescriptionHtml}
                        /></>)}
                </div>
                )}
            </div>
            {hasMultiple && (
                <nav
                    aria-label="Citizens"
                    className="flex pt-[30px] gap-[15px] justify-center"
                >
                    {citizens.map((citizen, index) => (
                        <button
                            key={citizen.id}
                            type="button"
                            aria-current={index === currentIndex}
                            aria-label={citizen.name}
                            onClick={() => handleSelect(index)}
                            className={`h-2 w-[90px] shrink-0 cursor-pointer border-0 border-[var(--black-color)] bg-transparent p-0 ${index === currentIndex
                                ? "border-b-[3px]"
                                : "border-b-[1px]"
                                }`}
                        />
                    ))}
                </nav>
            )}
        </>
    );
};

export default CreativeCitizensContentDesktop;