import { cn } from '@/lib/utils'
import { ClientCitizen } from '@/schemas/citizenSchema'
import React from 'react'

type Props = {
    citizen: ClientCitizen
    className?: string
}

function CreativeCitizensImage({ citizen, className }: Props) {
    return (
        <div data-citizen-image className={cn(className, "w-[244px] h-[339px] md:w-[364px] md:h-[508px] lg:w-[508px] lg:h-[728px] mx-auto relative")}>
            <img src={citizen.image_url} alt={citizen.name} className="w-full h-full object-cover absolute" />
        </div>
    )
}

export default CreativeCitizensImage