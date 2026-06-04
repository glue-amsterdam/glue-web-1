import { cn } from '@/lib/utils';


import MainContainer from '../../main-container'
import SlidingTextArea from './sliding-text-area';



type Props = {}

function BottomNavigation({ }: Props) {
    const textStyles = 'text-[21px] lg:text-[36px] leading-[21px] lg:leading-[36px] font-[400]';

    return (
        <aside id='bottom-banner' aria-label="Event dates and tagline" className='fixed bottom-0 right-0 left-0 z-50 bg-(--white-color)'>
            <MainContainer>
                <SlidingTextArea />
                <div className='flex justify-between items-center h-[65px] border-t border-(--black-color) lg:border-t-2 py-3'>
                    <h2 className="sr-only">Footer</h2>
                    <p className={cn('hidden md:flex', textStyles)}>17. — 19. september</p>
                    <p className={cn(textStyles)}>amsterdam connected by design</p></div>
            </MainContainer>
        </aside>

    )
}

export default BottomNavigation