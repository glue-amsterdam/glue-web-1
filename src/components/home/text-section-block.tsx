import React from 'react'
import BigButton from '../big-button'

type Props = {
    button: boolean,
    description: string,
    title: string,
    sectionId: string,
    buttonLink?: string,
    buttonLabel?: string,
}

function TextSectionBlock({ button = true, description, title, sectionId, buttonLink, buttonLabel }: Props) {
    return (
        <section id={sectionId} className="main-padding">
            <h2 className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">{title.toUpperCase()}</h2>
            <p className='pt-[40px] lg:pt-[60px] max-w-[830px] text-[15px] leading-[21px] lg:text-[23px] lg:leading-[29px]'>{description}</p>
            {button && <div className='pt-[40px] lg:pt-[60px] flex justify-center'>
                <BigButton as="link" label={buttonLabel ?? 'no_label'} href={buttonLink ?? 'no_link'} mode='big' />
            </div>}
        </section>
    )
}

export default TextSectionBlock