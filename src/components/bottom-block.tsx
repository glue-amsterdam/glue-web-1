
import OurPartners from './partners-section/our-partners'
import BottomFooter from './bottom-footer'

type Props = {}

function BottomBlock({ }: Props) {
    return (
        <div className="pb-[65px]">
            <OurPartners />
            <BottomFooter />
        </div>
    )
}

export default BottomBlock