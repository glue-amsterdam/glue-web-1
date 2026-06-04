import React from 'react'
import BigButton from '../../big-button'
import { ExhibitorItem } from '@/lib/participants/exhibitor-types';
import ExhibitorsGrid from '@/components/exhibitors/exhibitors-grid';

type Props = {}
const participants: ExhibitorItem[] = [
    {
        displayNumber: "01",
        type: "special-program",
        name: "Laurent Muller",
        imageUrl: "/mockup/participants/participant-6.png",
        slug: "exhibitor-1",
        hubDisplayNumber: "01",
    },
    {
        displayNumber: "02",
        name: "Studio 2",
        type: "up-to-three-participants",
        imageUrl: "/mockup/participants/participant-2.png",
        slug: "exhibitor-2",
        hubDisplayNumber: null,
    },
    {
        displayNumber: "03",
        type: "hub",
        name: "Studio 3",
        imageUrl: "/mockup/participants/participant-4.png",
        slug: "exhibitor-3",
        hubDisplayNumber: "03",
    },
    {
        displayNumber: "04",
        type: "hub",
        name: "Studio 4",
        imageUrl: "/mockup/participants/participant-3.png",
        slug: "exhibitor-4",
        hubDisplayNumber: "04",
    },
    {
        displayNumber: "05",
        type: "hub",
        name: "Studio 5",
        imageUrl: "/mockup/participants/participant-5.png",
        slug: "exhibitor-5",
        hubDisplayNumber: "05",
    },
    {
        displayNumber: "06",
        type: "hub",
        name: "Studio 6",
        imageUrl: "/mockup/participants/participant-1.png",
        slug: "exhibitor-6",
        hubDisplayNumber: null,
    },
]



function ExhibitorsHome({ }: Props) {
    const page_texts = {
        title: "Exhibitors 2026",
    }

    const participants_data = participants.map((participant) => ({
        ...participant,
        type: participant.type as "special-program" | "up-to-three-participants" | "hub",
    }))


    return (
        <section id="exhibitors-home" className="main-padding">
            <h2 className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">{page_texts.title.toUpperCase()}</h2>
            <ExhibitorsGrid exhibitors={participants_data} loading={false} mode="section" />
            <div className='pt-[40px] lg:pt-[60px] flex justify-center'>
                <BigButton as="link" label='view all' href='/exhibitors' mode='big' />
            </div>
        </section>
    );
}
export default ExhibitorsHome;