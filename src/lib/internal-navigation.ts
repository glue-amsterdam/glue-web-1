const DEPTH_KEY = 'glue-internal-nav-depth'
const POPSTATE_KEY = 'glue-internal-nav-popstate'
const SKIP_INCREMENT_KEY = 'glue-internal-nav-skip-increment'

export const getInternalNavDepth = (): number => {
  if (typeof window === 'undefined') return 0
  return Number(sessionStorage.getItem(DEPTH_KEY) || '0')
}

export const canGoBackInternally = (): boolean => {
  return getInternalNavDepth() > 0 && window.history.length > 1
}

export const resetInternalNavDepth = (): void => {
  sessionStorage.setItem(DEPTH_KEY, '0')
}

export const markPopstateNavigation = (): void => {
  sessionStorage.setItem(POPSTATE_KEY, '1')
}

export const consumePopstateNavigation = (): boolean => {
  if (sessionStorage.getItem(POPSTATE_KEY) === '1') {
    sessionStorage.removeItem(POPSTATE_KEY)
    return true
  }
  return false
}

export const incrementInternalNavDepth = (): void => {
  const depth = getInternalNavDepth() + 1
  sessionStorage.setItem(DEPTH_KEY, String(depth))
}

export const decrementInternalNavDepth = (): void => {
  const depth = getInternalNavDepth()
  sessionStorage.setItem(DEPTH_KEY, String(Math.max(0, depth - 1)))
}

export const skipNextInternalNavIncrement = (): void => {
  sessionStorage.setItem(SKIP_INCREMENT_KEY, '1')
}

export const consumeSkipInternalNavIncrement = (): boolean => {
  if (sessionStorage.getItem(SKIP_INCREMENT_KEY) === '1') {
    sessionStorage.removeItem(SKIP_INCREMENT_KEY)
    return true
  }
  return false
}
