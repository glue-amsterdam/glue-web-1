import React from 'react'
import TextSectionBlock from '../../text-section-block'

type Props = {}

function NewsletterHomeSection({ }: Props) {
    const page_texts = {
        title: "Subscribe  Newsletter",
        description: "Stay tuned for what's to come! Updates about new events, locations and highlights selected by our crew and experts.",
    }
    return (
        <TextSectionBlock
            button={true}
            description={page_texts.description}
            title={page_texts.title}
            sectionId="newsletter-section"
            buttonLink="/newsletter"
            buttonLabel="subscribe"
        />
    )
}

export default NewsletterHomeSection