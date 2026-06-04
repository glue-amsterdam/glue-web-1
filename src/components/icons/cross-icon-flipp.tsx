import React from 'react'
import CrossRotatedMobile from './cross-rotated-mobile'
import PlusButtonMobile from './plus-button-mobile'
import PlusIconDesktop from './plus-icon-desktop'
import CrossRotatedDesktop from './cross-rotated-desktop'

type Props = {
    isOpen: boolean
}

function CrossIconFlipp({ isOpen }: Props) {
    return (
        isOpen ? (
            <>
                <div className="lg:hidden">
                    <CrossRotatedMobile />
                </div>
                <div className="hidden lg:block">
                    <CrossRotatedDesktop />
                </div>
            </>
        ) : (
            <>
                <div className="lg:hidden">
                    <PlusButtonMobile />
                </div>
                <div className="hidden lg:block">
                    <PlusIconDesktop />
                </div>
            </>
        )
    )
}

export default CrossIconFlipp