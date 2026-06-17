import React from 'react'

type Props = {
    title: string
}

function CreativeCitizensTitle({ title }: Props) {
    const upperTitle = title.toUpperCase();
    return (
        <div data-citizen-name className="pt-[30px] md:pt-[40px] lg:pt-[60px]">
            <h3 className="text-[15px] leading-[21px] lg:text-[19px] lg:leading-[25px]">{upperTitle}</h3>
        </div>
    )
}

export default CreativeCitizensTitle