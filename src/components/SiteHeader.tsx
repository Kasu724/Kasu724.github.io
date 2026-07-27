function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__brand" href="#top">
        Portfolio name placeholder
      </a>

      <nav className="site-header__nav" aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  )
}

export default SiteHeader