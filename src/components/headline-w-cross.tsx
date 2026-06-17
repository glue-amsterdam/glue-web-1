import React from 'react'
import CrossButton from './cross-button';

type Props = {
  title: string;
  closeFallbackHref?: string;
  preferCloseFallback?: boolean;
};

function HeadlineWCross({
  title,
  closeFallbackHref = "/",
  preferCloseFallback = false,
}: Props) {
  return (
    <div className="flex justify-between items-start">
      <h1 className="title-text lg:max-w-[1090px]">{title.toUpperCase()}</h1>
      <div className="md:hidden">
        <CrossButton
          mode="small"
          fallbackHref={closeFallbackHref}
          preferFallback={preferCloseFallback}
        />
      </div>
      <div className="hidden md:block">
        <CrossButton
          mode="large"
          fallbackHref={closeFallbackHref}
          preferFallback={preferCloseFallback}
        />
      </div>
    </div>
  );
}

export default HeadlineWCross