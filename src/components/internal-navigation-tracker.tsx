'use client'

import {
  consumePopstateNavigation,
  consumeSkipInternalNavIncrement,
  decrementInternalNavDepth,
  incrementInternalNavDepth,
  markPopstateNavigation,
  resetInternalNavDepth,
} from '@/lib/internal-navigation'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const InternalNavigationTracker = () => {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    const handlePopState = () => {
      markPopstateNavigation()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      resetInternalNavDepth()
      return
    }

    if (consumePopstateNavigation()) {
      decrementInternalNavDepth()
      return
    }

    if (consumeSkipInternalNavIncrement()) {
      return
    }

    incrementInternalNavDepth()
  }, [pathname])

  return null
}

export default InternalNavigationTracker
