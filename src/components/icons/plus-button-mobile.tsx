import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
    mode?: 'small' | 'large'
    className?: string
}

function PlusButtonMobile({ mode, className }: Props) {
    const size = mode === 'large' ? '24' : '12'
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
            <line x1="5.75" y1="-2.18557e-08" x2="5.75" y2="12" stroke="black" />
            <line x1="12" y1="5.5" y2="5.5" stroke="black" />
        </svg>

    )
}

export default PlusButtonMobile


