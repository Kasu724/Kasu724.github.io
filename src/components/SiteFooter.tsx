import { useEffect, useState } from 'react'

const deploymentCommit = import.meta.env.VITE_DEPLOYMENT_COMMIT ?? '4d65931'
const deploymentCommitUrl = `https://github.com/Kasu724/Kasu724.github.io/commit/${deploymentCommit}`
const viewCountStorageKey = 'kasu724-portfolio-view-count'

function getNextViewCount() {
  try {
    const storedViewCount = Number.parseInt(
      window.localStorage.getItem(viewCountStorageKey) ?? '0',
      10,
    )

    return (Number.isFinite(storedViewCount) ? storedViewCount : 0) + 1
  } catch {
    return 1
  }
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.35 7.8H1.57V20h3.78V7.8ZM3.46 2A2.19 2.19 0 1 0 3.46 6.38 2.19 2.19 0 0 0 3.46 2ZM20 13c0-3.67-1.96-5.38-4.57-5.38a4.42 4.42 0 0 0-4 2.2V7.8H7.66V20h3.78v-6.04c0-1.59.3-3.13 2.27-3.13 1.94 0 1.96 1.82 1.96 3.23V20h3.78L20 13Z"
      />
    </svg>
  )
}

function SiteFooter() {
  const [timeOnSite, setTimeOnSite] = useState(0)
  const [viewCount] = useState(getNextViewCount)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeOnSite((currentTime) => currentTime + 1)
    }, 1000)

    try {
      window.localStorage.setItem(viewCountStorageKey, String(viewCount))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }

    return () => window.clearInterval(timer)
  }, [viewCount])

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <span>© {new Date().getFullYear()} Kevin</span>
          <span className="site-footer__separator" aria-hidden="true">
            -
          </span>
          <span className="site-footer__status">
            <span className="site-footer__status-dot" aria-hidden="true" />
            All Services Nominal
          </span>
        </div>

        <div className="site-footer__details">
          <span className="site-footer__metric">
            <span aria-hidden="true">◷</span>
            <span className="sr-only">Time on site:</span> {formatDuration(timeOnSite)}
          </span>
          <span className="site-footer__separator" aria-hidden="true">
            -
          </span>
          <span className="site-footer__metric">
            <span aria-hidden="true">◉</span>
            <span className="sr-only">Site views:</span> {viewCount.toLocaleString()} views
          </span>
          <span className="site-footer__separator" aria-hidden="true">
            -
          </span>
          <a
            className="site-footer__commit"
            href={deploymentCommitUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span aria-hidden="true">⌘</span>
            <span className="sr-only">Deployment commit:</span> {deploymentCommit}
          </a>
          <span className="site-footer__separator" aria-hidden="true">
            -
          </span>
          <a
            className="site-footer__social-link"
            href="https://github.com/Kasu724"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <GithubIcon />
          </a>
          <a
            className="site-footer__social-link"
            href="#"
            aria-label="LinkedIn profile placeholder"
          >
            <LinkedinIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
