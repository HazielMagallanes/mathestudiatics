import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/ui/cn'

interface ExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  const { t } = useTranslation()

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline',
        className,
      )}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-3.5 shrink-0"
      >
        <path d="M6 3h7v7" />
        <path d="M13 3 6.5 9.5" />
        <path d="M12 10.5V13H3V4h2.5" />
      </svg>
      <span className="sr-only">{t('common.opensInNewTab')}</span>
    </a>
  )
}
