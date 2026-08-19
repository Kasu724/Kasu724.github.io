import ThemeMenu from './ThemeMenu'
import type { Page } from '../App'

type SiteHeaderProps = {
  currentPage: Page
}

const pageDetails: Record<Page, { label: string; href: string; path: string }> = {
  home: { label: 'Home', href: '/', path: '$HOME/' },
  about: { label: 'About', href: '/about/', path: '$HOME/About/' },
  projects: { label: 'Projects', href: '/projects/', path: '$HOME/Projects/' },
}

function SiteHeader({ currentPage }: SiteHeaderProps) {
  const currentPath = pageDetails[currentPage].path
  const pagePath = currentPath.slice('$HOME'.length)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand" aria-label={`Current path: ${currentPath}`}>
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

        <nav className="site-header__nav" aria-label="Primary navigation">
          {(Object.entries(pageDetails) as [Page, (typeof pageDetails)[Page]][])
            .filter(([page]) => page !== currentPage)
            .map(([page, details]) => (
              <a href={details.href} key={page}>
                {details.label}
              </a>
            ))}
          <ThemeMenu />
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
