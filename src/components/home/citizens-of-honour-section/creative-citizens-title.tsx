import React from 'react'

type Props = {
    title: string
}

function CreativeCitizensTitle({ title }: Props) {
    const upperTitle = title.toUpperCase();
    return (
        <div data-citizen-name className="citizen-image-padding">
            <h3 className="versal-body-text">{upperTitle}</h3>
        </div>
    )
}

export default CreativeCitizensTitle