
import React from 'react'
import TextSectionBlock from '../text-section-block'

type Props = {}

function BecomeAnExhibitor({ }: Props) {
    const page_texts = {
        title: "Become part of the GLUE design route 2026",
        description: "Are you a designer, member of the general public, architect, brand, label, showroom, gallery, academy or other colleague and would like to take part in the Design Route and showcase your work? Then sign up now! You can find details on how to participate here.",
    }
    return (
        <TextSectionBlock
            button={true}
            description={page_texts.description}
            title={page_texts.title}
            sectionId="become-an-exhibitor"
            buttonLink="/participate"
            buttonLabel="learn more"
        />
    )
}

export default BecomeAnExhibitor