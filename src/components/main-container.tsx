import { cn } from '@/lib/utils';


type Props = {
    children: React.ReactNode;
    className?: string;
}

function MainContainer({ children, className }: Props) {
    return (
        <div className={cn('px-8 xl:px-0 lg:max-w-[1260px] mx-auto', className)}>
            {children}
        </div>
    )
}

export default MainContainer