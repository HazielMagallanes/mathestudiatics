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

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="size-5"
    >
      {open ? (
        <>
          <path d="M5 5l10 10" />
          <path d="M15 5 5 15" />
        </>
      ) : (
        <>
          <path d="M3 6h14" />
          <path d="M3 10h14" />
          <path d="M3 14h14" />
        </>
      )}
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
    <header className="border-rule bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <BrandMark />
          <span className="truncate font-serif text-lg font-semibold tracking-tight">
            {t('app.name')}
          </span>
        </Link>

        <nav aria-label={t('nav.menu')} className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={desktopLinkClass}>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Compact controls: hidden on very narrow screens (they live in the panel there). */}
          <div className="hidden items-center gap-2 xs:flex">
            <LocaleSwitcher compact />
            <ThemeSwitcher compact />
          </div>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="site-menu-mobile"
            aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => {
              setOpenedAt(isMenuOpen ? null : location.pathname)
            }}
            className="border-rule bg-surface-raised text-fg-muted hover:text-accent flex size-8 items-center justify-center rounded-md border md:hidden"
          >
            <BurgerIcon open={isMenuOpen} />
          </button>
        </div>
      </div>

      <nav
        id="site-menu-mobile"
        aria-label={t('nav.mobileMenu')}
        className={cn('border-rule md:hidden', isMenuOpen ? 'block' : 'hidden')}
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

        {/* Below the compact-controls breakpoint the full controls live here. */}
        <div className="border-rule mx-auto flex max-w-5xl flex-wrap items-center gap-3 border-t px-4 py-3 sm:px-6 xs:hidden">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  )
}
