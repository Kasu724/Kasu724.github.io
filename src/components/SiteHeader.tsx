import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import ThemeMenu from './ThemeMenu'
import type { Page } from '../App'

type SiteHeaderProps = {
  currentPage: Page
}

const pageDetails: Record<Page, { label: string; href: string; path: string }> = {
  home: { label: 'Home', href: '/', path: '$HOME/' },
  about: { label: 'About', href: '/about/', path: '$HOME/about/' },
  projects: { label: 'Projects', href: '/projects/', path: '$HOME/projects/' },
  resume: { label: 'Resume', href: '/resume/', path: '$HOME/resume/' },
  food: { label: 'Food', href: '/food/', path: '$HOME/food/' },
}

function SiteHeader({ currentPage }: SiteHeaderProps) {
  const currentPath = pageDetails[currentPage].path
  const pagePath = currentPath.slice('$HOME'.length)
  const innerRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const drawerRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [drawerRequested, setDrawerRequested] = useState(false)

  const measureCompact = useCallback(() => {
    const inner = innerRef.current
    const brand = brandRef.current
    const nav = navRef.current
    if (!inner || !brand || !nav) return false

    const styles = getComputedStyle(inner)
    const gap = Number.parseFloat(styles.columnGap) || 0
    const availableWidth = inner.clientWidth
      - (Number.parseFloat(styles.paddingLeft) || 0)
      - (Number.parseFloat(styles.paddingRight) || 0)
    const brandWidth = Math.max(brand.getBoundingClientRect().width, brand.scrollWidth)
    const requiredWidth = brandWidth + nav.scrollWidth + gap
    return requiredWidth > availableWidth + 0.5
  }, [])

  const subscribeToLayout = useCallback((notify: () => void) => {
    const observed = [innerRef.current, brandRef.current, navRef.current]
      .filter((element): element is HTMLElement => element !== null)
    const observer = new ResizeObserver(notify)
    observed.forEach((element) => observer.observe(element))
    window.addEventListener('resize', notify)
    document.fonts?.addEventListener('loadingdone', notify)
    document.fonts?.ready.then(notify)
    notify()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', notify)
      document.fonts?.removeEventListener('loadingdone', notify)
    }
  }, [])

  const isCompact = useSyncExternalStore(subscribeToLayout, measureCompact, () => false)

  useEffect(() => {
    const prefetchLinks = Object.entries(pageDetails)
      .filter(([page]) => page !== currentPage)
      .map(([, details]) => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'document'
        link.href = details.href
        document.head.append(link)
        return link
      })

    return () => prefetchLinks.forEach((link) => link.remove())
  }, [currentPage])

  useLayoutEffect(() => {
    const drawer = drawerRef.current
    if (!drawer) return

    if (drawerRequested && isCompact && !drawer.open) {
      drawer.showModal()
    } else if ((!drawerRequested || !isCompact) && drawer.open) {
      drawer.close()
    }
  }, [drawerRequested, isCompact])

  useLayoutEffect(() => {
    if (!drawerRequested || !isCompact) return

    const root = document.documentElement
    const body = document.body
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousBodyPaddingRight = body.style.paddingRight
    const scrollbarGutter = Math.max(0, window.innerWidth - root.clientWidth)
    const bodyPaddingRight = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbarGutter > 0) {
      body.style.paddingRight = `${bodyPaddingRight + scrollbarGutter}px`
    }

    return () => {
      root.style.overflow = previousRootOverflow
      body.style.overflow = previousBodyOverflow
      body.style.paddingRight = previousBodyPaddingRight
    }
  }, [drawerRequested, isCompact])

  useEffect(() => {
    if (!drawerRequested) return

    function closeDrawerOnPopState() {
      setDrawerRequested(false)
    }

    window.addEventListener('popstate', closeDrawerOnPopState)
    return () => window.removeEventListener('popstate', closeDrawerOnPopState)
  }, [drawerRequested])

  return (
    <header className={`site-header${isCompact ? ' is-compact' : ''}`}>
      <div className="site-header__inner" ref={innerRef}>
        <div className="site-header__brand" ref={brandRef} aria-label={`Current path: ${currentPath}`}>
          {currentPage === 'home' ? (
            <span className="site-header__home-path">$HOME</span>
          ) : (
            <a className="site-header__home-path-link" href="/">
              $HOME
            </a>
          )}
          <span className="site-header__page-path">{pagePath}</span>
          <span className="site-header__cursor" aria-hidden="true" />
        </div>

        <nav
          className="site-header__nav"
          aria-label="Primary navigation"
          aria-hidden={isCompact || undefined}
          inert={isCompact}
          ref={navRef}
        >
          {(Object.entries(pageDetails) as [Page, (typeof pageDetails)[Page]][]).map(([page, details]) => (
            <a
              href={details.href}
              key={page}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {details.label}
            </a>
          ))}
          <ThemeMenu idPrefix="header" />
        </nav>

        {isCompact && (
          <button
            className="site-header__menu-button"
            type="button"
            aria-label="Open navigation and theme settings"
            aria-haspopup="dialog"
            aria-expanded={drawerRequested}
            aria-controls="site-header-drawer"
            onClick={() => setDrawerRequested(true)}
            ref={menuButtonRef}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </div>

      <dialog
        className="site-header__drawer-dialog"
        id="site-header-drawer"
        aria-label="Site navigation and theme settings"
        ref={drawerRef}
        onCancel={() => setDrawerRequested(false)}
        onClose={() => {
          setDrawerRequested(false)
          if (isCompact) menuButtonRef.current?.focus()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setDrawerRequested(false)
        }}
      >
        <div className="site-header__drawer">
          <div className="site-header__drawer-heading">
            <span>Navigation</span>
            <button
              className="site-header__drawer-close"
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawerRequested(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <nav className="site-header__drawer-nav" aria-label="Page navigation">
            {(Object.entries(pageDetails) as [Page, (typeof pageDetails)[Page]][]).map(([page, details]) => (
              <a
                href={details.href}
                key={page}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => setDrawerRequested(false)}
              >
                {details.label}
              </a>
            ))}
          </nav>
          <div className="site-header__drawer-theme">
            <h2>Theme</h2>
            <ThemeMenu idPrefix="drawer" label="Change theme" />
          </div>
        </div>
      </dialog>
    </header>
  )
}

export default SiteHeader
