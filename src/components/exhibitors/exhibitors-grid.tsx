import { ExhibitorItem } from '@/lib/participants/exhibitor-types'
import { getExhibitorItemKey } from "@/lib/participants/exhibitors-filters";

import SrOnlySanitized from "@/components/sr-only-sanitized";
import ExhibitorCard from './exhibitor-card';

type SectionProps = {
    exhibitors: ExhibitorItem[]
    loading: boolean
    mode: 'section'
    title: string
    description: string
}

type FullPageProps = {
    exhibitors: ExhibitorItem[]
    loading: boolean
    mode: 'fullpage'
    title?: never
    description?: never
}

type Props = SectionProps | FullPageProps

const MOBILE_COUNT = 3;

function ExhibitorsGrid({ exhibitors, loading, mode, title, description }: Props) {
    if (mode === 'fullpage') {
        return (
            <ul
                className={`grid grid-cols-1 lg:grid-cols-3 gap-y-[60px] lg:gap-x-[30px] list-none place-self-center ${loading ? "opacity-60 pointer-events-none" : ""
                    }`}
                aria-busy={loading}
            >
                {exhibitors.map((exhibitor) => (
                    <li key={getExhibitorItemKey(exhibitor)} className="mx-auto w-full">
                        <ExhibitorCard exhibitor={exhibitor} />
                    </li>
                ))}
            </ul>
        )
    }
    if (mode === 'section') {
        return (
            <>
                <h2 className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">
                    {title.toUpperCase()}
                </h2>
                <SrOnlySanitized html={description} />
                <div className="grid grid-cols-1 lg:grid-cols-3 pt-10 gap-y-[40px] lg:gap-x-[30px] justify-self-center lg:justify-self-auto">
                    {/* Mobile: 3 */}
                    <div className="contents lg:hidden">
                        {exhibitors.slice(0, MOBILE_COUNT).map((participant) => (
                            <ExhibitorCard key={getExhibitorItemKey(participant)} exhibitor={participant} />
                        ))}
                    </div>
                    {/* Desktop: 6 */}
                    <div className="hidden lg:contents">
                        {exhibitors.map((exhibitor) => (
                            <ExhibitorCard key={getExhibitorItemKey(exhibitor)} exhibitor={exhibitor} />
                        ))}
                    </div>
                </div>
            </>
        )
    }
}

export default ExhibitorsGrid