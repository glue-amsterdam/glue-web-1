import React from 'react'
import TextSectionBlock from '../text-section-block'

type Props = {}

function HomeTextSection({ }: Props) {
  const page_texts = {
    title: "ALTERNATIVES FROM THE UNEXPECTED",
    description: "Among the over 140 participants this year are 28 creatives who are curated to stretch the definition of design and to bring inspiration and debate. Under the name Alternatives from the Unexpected, these designers are spread throughout Amsterdam in various HUBS and other unique locations. Come and explore the boundaries between art, fashion, and design, and find out who they are and what alternatives they propose, see page 10. The city lives, the streets speak. This guide connects you to the GLUE community.",
  }
  return (
    <TextSectionBlock
      button={false}
      description={page_texts.description}
      title={page_texts.title}
      sectionId="text-section"
    />
  )
}

export default HomeTextSection