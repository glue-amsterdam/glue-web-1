import { cn } from '@/lib/utils';
import React from 'react'

type Props = {
    noBorderBottom?: boolean;
}

function Separator({ noBorderBottom }: Props) {
    return (
        <div className={cn('main-padding', noBorderBottom ? 'border-b-0' : 'main-boder-bottom')} aria-hidden="true" />
    )
}

export default Separator