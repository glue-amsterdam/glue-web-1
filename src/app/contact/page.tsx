import BottomBlock from '@/components/bottom-block';
import MainContainer from '@/components/main-container';
import { contactMetadata } from '@/lib/metadata';
import { sanitizeHtml } from '@/lib/sanitize-html';
import type { Metadata } from 'next';

export const metadata: Metadata = contactMetadata;

type Props = {}

const contactContent = {
    title: 'Contact',
    description: [`GLUE<br />Veerstraat 53<br/>1075 SN Amsterdam<br />`, `+31 (0)6 5494 0225<br />`, `info@glue.amsterdam`]
}


export default function Page({ }: Props) {
    const sanitizedDescription = contactContent.description.map(description => sanitizeHtml(description));
    return (
        <main id="privacy-policy-page" className="first-padding">
            <MainContainer className="stagger-enter">
                <h1 className="title-text">{contactContent.title.toUpperCase()}</h1>
                <div className='grid grid-cols-1 gap-[30px] pt-[30px] lg:pt-[60px]'>
                    {sanitizedDescription.map((description, index) => (
                        <p key={index} className="base-text-size mt-2" dangerouslySetInnerHTML={{ __html: description }} />
                    ))}
                </div>
                <BottomBlock />
            </MainContainer>
        </main>
    )
}