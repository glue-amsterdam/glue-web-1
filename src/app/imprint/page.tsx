import MainContainer from '@/components/main-container'
import { imprintMetadata } from '@/lib/metadata';
import { Metadata } from 'next'
import { sanitizeHtml } from "@/lib/sanitize-html";
import BottomBlock from '@/components/bottom-block';

type Props = {}

export const metadata: Metadata = imprintMetadata;

const imprintContent = {
    title: 'Imprint',
    description: [
        `Responsible for the content:<br />
GLUE<br />
amsterdam connected by design<br />
Veerstraat 53<br />1075 SN Amsterdam<br />`, `Website operator contact information: guus@glue.amsterdam<br />
Design: Haller Brun<br />
Texts: David Held<br />
Programming: Aldana Alegre <br />
Web Developer: Javier Azua <br />`, `An association under the name “GLUE” exists in accordance with Art. 60 ff. <br />of the Civil Code, with its registered office in Amsterdam. It is politically and religiously independent and a non-profit organization.<br />`, `IBAN: NL11 RABO0365450073<br />Chamber or Commerce nr.: KVK81998740<br />VAT nr.: NL862299159B01<br />`
    ]

}

function Page({ }: Props) {
    const sanitizedDescription = imprintContent.description.map(description => sanitizeHtml(description));
    return (
        <main id="privacy-policy-page" className="first-padding">
            <MainContainer>

                <h1 className="title-text">{imprintContent.title.toUpperCase()}</h1>
                <div className='grid grid-cols-1 gap-[30px] lg:gap-[60px]'>
                    {sanitizedDescription.map((description, index) => (
                        <p key={index} className="base-text-size mt-2" dangerouslySetInnerHTML={{ __html: description }} />
                    ))}
                </div>
                <BottomBlock />
            </MainContainer>
        </main>
    )
}

export default Page