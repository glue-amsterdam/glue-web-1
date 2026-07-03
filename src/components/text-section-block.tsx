import BigButton from './big-button'
import SanitizedHtmlGrid from './sanitized-html-grid'
import { sanitizeHtml } from '@/lib/sanitize-html'

type Props = {
    button: boolean,
    description: string,
    title: string,
    sectionId: string,
    buttonLink?: string,
    buttonLabel?: string,
    shouldGrid?: boolean,
    bodyClassName?: 'body-label' | 'body-text',
    className?: string,
}

function TextSectionBlock({ button = true, description, title, sectionId, buttonLink, buttonLabel, shouldGrid = false, bodyClassName = 'body-label', className }: Props) {
    const sanitizedDescription = sanitizeHtml(description);

    return (
        <section id={sectionId} className={className}>
            <h2 className="title-text mini-padding">{title.toUpperCase()}</h2>
            {shouldGrid ? (
                <SanitizedHtmlGrid
                    html={description}
                    className="title-padding"
                    itemClassName="body-label [&_strong]:uppercase"
                />
            ) : (
                <div
                    className={`title-padding lg:max-w-(--paragraph-max-width) ${bodyClassName} post-content post-content-tight`}
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
            )}
            {button &&
                <div className='title-padding flex justify-center'>
                    <BigButton as="link" label={buttonLabel ?? 'no_label'} href={buttonLink ?? 'no_link'} mode='big' />
                </div>}
        </section>
    )
}

export default TextSectionBlock
