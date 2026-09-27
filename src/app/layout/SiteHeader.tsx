import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation } from 'react-router'

import { LocaleSwitcher } from '@/app/layout/LocaleSwitcher'
import { ThemeSwitcher } from '@/app/layout/ThemeSwitcher'
import { cn } from '@/shared/ui/cn'

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/study', labelKey: 'nav.study' },
  { to: '/practice', labelKey: 'nav.practice' },
  { to: '/tools', labelKey: 'nav.tools' },
  { to: '/about', labelKey: 'nav.about' },
] as const

function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="size-7 shrink-0">
      <rect width="64" height="64" rx="12" className="fill-primary" />
      <path
        d="M18 18h28l-14 15 14 15H18"
        fill="none"
        className="stroke-primary-contrast"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SiteHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const isMenuOpen = openedAt === location.pathname

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenedAt(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-sm px-1.5 py-1 text-sm font-medium tracking-wide transition-colors hover:text-accent',
      isActive ? 'text-accent' : 'text-fg-muted',
    )

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('block px-1 py-2 text-sm font-medium', isActive ? 'text-accent' : 'text-fg-muted')

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-serif text-lg font-semibold tracking-tight">{t('app.name')}</span>
        </Link>

        <nav aria-label={t('nav.menu')} className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={desktopLinkClass}>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="site-menu-mobile"
            onClick={() => {
              setOpenedAt(isMenuOpen ? null : location.pathname)
            }}
            className="rounded-md border border-rule bg-surface-raised px-2 py-1 text-xs font-semibold text-fg-muted md:hidden"
          >
            {t('nav.menu')}
          </button>
        </div>
      </div>

      <nav
        id="site-menu-mobile"
        aria-label={t('nav.mobileMenu')}
        className={cn('border-t border-rule md:hidden', isMenuOpen ? 'block' : 'hidden')}
      >
        <ul className="mx-auto flex max-w-5xl flex-col px-4 py-2 sm:px-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={mobileLinkClass}
                onClick={() => {
                  setOpenedAt(null)
                }}
              >
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
