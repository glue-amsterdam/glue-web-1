import { ExhibitorItem } from '@/lib/participants/exhibitor-types'
import { getExhibitorItemKey } from "@/lib/participants/exhibitors-filters";

import ExhibitorCard from './exhibitor-card';

type Props = {
    exhibitors: ExhibitorItem[]
    loading: boolean
    mode: 'fullpage' | 'section'
}

const MOBILE_COUNT = 3;

function ExhibitorsGrid({ exhibitors, loading, mode }: Props) {
    if (mode === 'fullpage') {
        return (
            <ul
                className={`grid grid-cols-1 lg:grid-cols-3 gap-y-[60px] lg:gap-x-[30px] list-none place-self-center ${loading ? "opacity-60 pointer-events-none" : ""
                    }`}
                aria-busy={loading}
            >
                {exhibitors.map((exhibitor) => (
                    <li key={getExhibitorItemKey(exhibitor) + Math.random()} className="mx-auto w-full">
                        <ExhibitorCard exhibitor={exhibitor} />
                    </li>
                ))}
            </ul>
        )
    }
    if (mode === 'section') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 pt-10 gap-y-[40px] md:gap-x-[30px] justify-self-center md:justify-self-auto">
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
        )
    }
}

export default ExhibitorsGrid