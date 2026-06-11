import { useSanitizedHTML } from "@/hooks/useSanitizedHTML";
import { ClientCitizen } from '@/schemas/citizenSchema';
import { AnimatePresence, motion } from 'framer-motion'

import CreativeCitizensDescription from './creative-citizens-description';
import CreativeCitizensImage from './creative-citizens-image';
import CreativeCitizensTitle from './creative-citizens-title';

type Props = {
    currentCitizen: ClientCitizen | null
    description?: string
    hasMultiple: boolean
    currentIndex: number
    handleSelect: (index: number) => void
    citizens: ClientCitizen[]
    archiveYear?: number
}

type ContentProps = {
    currentCitizen: ClientCitizen
    archiveYear?: number
}

const Content = ({ currentCitizen, archiveYear }: ContentProps) => {
    const citizenDescriptionHtml = useSanitizedHTML(currentCitizen.description);

    return (
        <>
            <CreativeCitizensImage citizen={currentCitizen} archiveYear={archiveYear} />
            <CreativeCitizensTitle title={currentCitizen.name} />
            <CreativeCitizensDescription
                citizenId={currentCitizen.id}
                descriptionHtml={citizenDescriptionHtml}
            />
        </>
    )
}


const CreativeCitizensContentMobile = ({ description, currentCitizen, hasMultiple, currentIndex, handleSelect, citizens, archiveYear }: Props) => {
    const sectionDescriptionHtml = useSanitizedHTML(description ?? "");

    return (
        <>  {sectionDescriptionHtml && (
            <div
                className="text-[19px] leading-[26px]"
                dangerouslySetInnerHTML={{ __html: sectionDescriptionHtml }}
            />
        )}

            <AnimatePresence mode="wait">
                {currentCitizen && (
                    <motion.div
                        key={currentCitizen.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="pt-[60px]"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <Content currentCitizen={currentCitizen} archiveYear={archiveYear} />
                    </motion.div>
                )}
            </AnimatePresence>
            {hasMultiple && (
                <nav
                    aria-label="Citizens"
                    className="flex pt-[30px] gap-[15px] justify-center w-full flex-wrap"
                >
                    {citizens.map((citizen, index) => (
                        <button
                            key={citizen.id}
                            type="button"
                            aria-current={index === currentIndex}
                            aria-label={citizen.name}
                            onClick={() => handleSelect(index)}
                            className={`h-2 w-[90px] lg:w-[150px] shrink-0 cursor-pointer border-0 border-[var(--black-color)] bg-transparent p-0 ${index === currentIndex
                                ? "border-b-[3px] lg:border-b-[4px]"
                                : "border-b-[1px] lg:border-b-[2px]"
                                }`}
                        />
                    ))}
                </nav>
            )}
        </>
    );
};

export default CreativeCitizensContentMobile;