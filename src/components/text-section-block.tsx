import BigButton from './big-button'
import { sanitizeHtml } from '@/lib/sanitize-html'

type Props = {
    button: boolean,
    description: string,
    title: string,
    sectionId: string,
    buttonLink?: string,
    buttonLabel?: string,
}

function TextSectionBlock({ button = true, description, title, sectionId, buttonLink, buttonLabel }: Props) {
    const sanitizedDescription = sanitizeHtml(description);

    return (
        <section id={sectionId}>
            <h2 className="title-text pt-[15px] lg:pt-[30px]">{title.toUpperCase()}</h2>
            <div
                className="pt-[40px] lg:max-w-(--paragraph-max-width) base-text-size"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
            {button &&
                <div className='pt-[40px] lg:pt-[60px] flex justify-center'>
                    <BigButton as="link" label={buttonLabel ?? 'no_label'} href={buttonLink ?? 'no_link'} mode='big' />
                </div>}
        </section>
    )
}

export default TextSectionBlock
