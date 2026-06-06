import BigButton from './big-button'
import SanitizedDescription from './sanitized-description'

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
        <section id={sectionId}>
            <h2 className="title-text pt-[15px] lg:pt-[30px]">{title.toUpperCase()}</h2>
            <SanitizedDescription description={description} />
            {button &&
                <div className='pt-[40px] lg:pt-[60px] flex justify-center'>
                    <BigButton as="link" label={buttonLabel ?? 'no_label'} href={buttonLink ?? 'no_link'} mode='big' />
                </div>}
        </section>
    )
}

export default TextSectionBlock