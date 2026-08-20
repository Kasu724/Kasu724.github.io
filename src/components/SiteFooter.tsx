import { useEffect, useState } from 'react'
import { socialLinks } from '../data/socialLinks'
import { deploymentCommit as deploymentCommitSha } from 'virtual:site-metadata'

const deploymentCommit = deploymentCommitSha?.slice(0, 7) ?? 'unknown'
const deploymentCommitUrl = deploymentCommitSha
  ? `https://github.com/Kasu724/Kasu724.github.io/commit/${deploymentCommitSha}`
  : undefined
const goatCounterCode = import.meta.env.VITE_GOATCOUNTER_CODE?.trim() || 'kasu724'
const goatCounterTotalPath = 'TOTAL'
const timeOnSiteStorageKey = 'kasu724-portfolio-time-on-site'

type GoatCounter = {
  allow_local?: boolean
  no_onload?: boolean
  count?: (variables: { path: string }) => void
}

type GoatCounterWindow = Window & { goatcounter?: GoatCounter }

let goatCounterScriptPromise: Promise<void> | null = null
let goatCounterPageviewSent = false

function getStoredTimeOnSite() {
  try {
    const storedTime = Number.parseInt(
      window.localStorage.getItem(timeOnSiteStorageKey) ?? '0',
      10,
    )

    return Number.isFinite(storedTime) && storedTime >= 0 ? storedTime : 0
  } catch {
    return 0
  }
}

function loadGoatCounter() {
  if (!goatCounterCode) {
    return Promise.reject(new Error('VITE_GOATCOUNTER_CODE is not configured'))
  }

  const goatCounterWindow = window as GoatCounterWindow

  if (goatCounterWindow.goatcounter?.count) {
    return Promise.resolve()
  }

  if (goatCounterScriptPromise) {
    return goatCounterScriptPromise
  }

  goatCounterWindow.goatcounter = {
    allow_local: import.meta.env.DEV,
    no_onload: true,
  }
  goatCounterScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://gc.zgo.at/count.js'
    script.dataset.goatcounter = `https://${goatCounterCode}.goatcounter.com/count`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load GoatCounter'))
    document.head.appendChild(script)
  })

  return goatCounterScriptPromise
}

async function getGoatCounterViewCount(signal: AbortSignal) {
  if (!goatCounterCode) {
    return null
  }

  const counterUrl = `https://${goatCounterCode}.goatcounter.com/counter/${goatCounterTotalPath}.json`
  const response = await fetch(counterUrl, { cache: 'no-store', signal })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { count?: string | number }
  const count = Number.parseInt(String(data.count ?? '').replaceAll(',', ''), 10)

  return Number.isFinite(count) ? count : null
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5"
      />
      <circle
        cx="12"
        cy="15.5"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M12 12V7.5M12 12h4.25"
      />
    </svg>
  )
}

function CommitIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M12 2v7M12 15v7"
      />
      <circle
        cx="12"
        cy="12"
        r="3.4"
        fill="var(--color-surface-elevated)"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function SiteFooter() {
  const [timeOnSite, setTimeOnSite] = useState(getStoredTimeOnSite)
  const [viewCount, setViewCount] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeOnSite((currentTime) => currentTime + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(timeOnSiteStorageKey, String(timeOnSite))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
  }, [timeOnSite])

  useEffect(() => {
    if (!goatCounterCode) {
      return undefined
    }

    const controller = new AbortController()

    void loadGoatCounter()
      .then(() => {
        const goatCounterWindow = window as GoatCounterWindow

        if (!goatCounterPageviewSent) {
          goatCounterWindow.goatcounter?.count?.({ path: window.location.pathname })
          goatCounterPageviewSent = true
        }
      })
      .catch(() => undefined)

    void getGoatCounterViewCount(controller.signal)
      .then(setViewCount)
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setViewCount(null)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <span>{new Date().getFullYear()} Kevin Lui</span>
          <span className="site-footer__status">
            <span className="site-footer__status-dot" aria-hidden="true" />
            All Services Nominal
          </span>
        </div>

        <div className="site-footer__details">
          <span
            className="site-footer__metric site-footer__tooltip"
            data-tooltip="How long you've been on my site"
          >
            <span className="site-footer__icon site-footer__clock-icon" aria-hidden="true"><ClockIcon /></span>
            <span className="sr-only">Time on site:</span> {formatDuration(timeOnSite)}
          </span>
          <span
            className="site-footer__metric site-footer__tooltip"
            data-tooltip="Number of views on my site"
          >
            <span className="site-footer__icon" aria-hidden="true"><EyeIcon /></span>
            <span className="sr-only">Site views:</span> {viewCount?.toLocaleString() ?? '—'} views
          </span>
          <a
            className="site-footer__commit site-footer__tooltip"
            href={deploymentCommitUrl}
            target="_blank"
            rel="noreferrer"
            data-tooltip="Current deployment commit (click to view)"
          >
            <span className="site-footer__icon" aria-hidden="true"><CommitIcon /></span>
            <span className="sr-only">Deployment commit:</span> {deploymentCommit}
          </a>
          <a
            className="site-footer__social-link"
            href={socialLinks.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <GithubIcon />
          </a>
          <a
            className="site-footer__social-link"
            href={socialLinks.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
          >
            <LinkedinIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
