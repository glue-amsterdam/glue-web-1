'use client'

import {
  canGoBackInternally,
  skipNextInternalNavIncrement,
} from '@/lib/internal-navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {
  mode?: 'small' | 'large'
  fallbackHref?: string
}

const CrossButton = ({ mode = 'small', fallbackHref = '/' }: Props) => {
  const router = useRouter()
  const size = mode === 'large' ? '24' : '12'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (canGoBackInternally()) {
      window.history.back()
      return
    }

    skipNextInternalNavIncrement()
    router.push(fallbackHref)
  }

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      aria-label="Close"
      className="cursor-pointer"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M2.00007 0.999993L11.1925 10.1924" stroke="black" />
        <path d="M2 10.1914L11.1924 0.999019" stroke="black" />
      </svg>
    </Link>
  )
}

export default CrossButton
