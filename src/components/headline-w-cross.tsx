import React from 'react'
import CrossButton from './cross-button';

type Props = {
    title: string;

}

function HeadlineWCross({ title }: Props) {
    return (
        <div className='flex justify-between items-start'>
            <h1 className='title-text lg:max-w-[1090px]'>{title.toUpperCase()}</h1>
            <div className="md:hidden">
                <CrossButton mode="small" />
            </div>
            <div className="hidden md:block">
                <CrossButton mode="large" />
            </div>
        </div>
    )
}

export default HeadlineWCross