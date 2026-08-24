import { socialLinks } from '../data/socialLinks'

function AboutPage() {
  return (
    <main className="standalone-page">
      <section className="about-page" aria-labelledby="about-page-title">
        <h1 id="about-page-title" className="about-page__title">About Me</h1>

        <div className="about-page__layout">
          <img
            className="about-page__image"
            src={`${import.meta.env.BASE_URL}images/profile.jpg`}
            alt="Portrait of Kevin"
          />

          <div className="about-page__content">
            <p>
              <span className="about-page__sentence">
                Hey, I'm Kevin Lui! I'm a <strong>Computer Science student</strong> at{' '}
                <strong>Stevens Institute of Technology</strong> with minors in{' '}
                <strong>Quantitative Finance</strong> and <strong>Mathematics</strong>. I'm a
                previous SWE intern at <strong>Panasonic North America</strong> and the{' '}
                <strong>Head Quantitative Developer</strong> at{' '}
                <span
                  className="about-page__inline-link about-page__tooltip-trigger"
                  tabIndex={0}
                  aria-describedby="ssmif-tooltip"
                >
                  SSMIF
                  <span className="about-page__tooltip" id="ssmif-tooltip" role="tooltip">
                    Stevens Student Managed Investment Fund
                  </span>
                </span>
                . I like to make cool{' '}
                <a className="about-page__inline-link" href="/projects/">projects</a> and do
                game dev when I'm bored.
              </span>
              <span className="about-page__sentence">
                Outside of software, I enjoy playing volleyball, drawing, watching anime,
                playing Minecraft, and eating good{' '}
                <a className="about-page__inline-link" href="/food/">food</a>. Feel free to
                shoot me an{' '}
                <a className="about-page__inline-link" href={socialLinks.email}>email</a> if
                you'd like to chat.
              </span>
            </p>

            <div className="about-page__links" aria-label="Contact links">
              <a href={socialLinks.github} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
                  />
                </svg>
                GitHub
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z"
                  />
                </svg>
                LinkedIn
              </a>
              <a href={socialLinks.email}>
                <svg className="about-page__mail-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                klui7240@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AboutPage
