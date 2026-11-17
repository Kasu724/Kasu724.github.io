import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { socialLinks } from '../data/socialLinks'
import { getCachedRecentCommits, loadDeploymentCommit, type RecentCommit } from '../data/githubCommits'
import { deploymentCommit as deploymentCommitSha } from 'virtual:site-metadata'
import { ClockIcon, CommitIcon, EyeIcon } from './ServiceIcons'
import type { ServiceHealth, ServiceKey } from './serviceStatus'
import { useServiceStatus } from './useServiceStatus'

const isDeployedBuild = deploymentCommitSha !== 'dev'
const deploymentCommit = isDeployedBuild ? deploymentCommitSha.slice(0, 7) : 'dev'
const deploymentCommitUrl = isDeployedBuild
  ? `https://github.com/Kasu724/Kasu724.github.io/commit/${deploymentCommitSha}`
  : undefined
const deploymentCommitDateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})
const developmentCommitDetails = {
  summary: 'Development build · unavailable',
  additions: '+—',
  deletions: '-—',
}
type FooterTooltipPlacement = { left: number; bottom?: number; top?: number }

function getFooterTooltipPlacement(trigger: HTMLElement, tooltipId: string): FooterTooltipPlacement {
  const tooltip = document.getElementById(tooltipId)
  const bounds = trigger.getBoundingClientRect()
  const tooltipBounds = tooltip?.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const width = tooltipBounds?.width ?? 0
  const height = tooltipBounds?.height ?? 0
  const left = Math.min(
    Math.max(bounds.left + bounds.width / 2 - width / 2, 8),
    Math.max(8, viewportWidth - width - 8),
  )
  if (bounds.top < height + 16) {
    return { left, top: Math.min(Math.max(8, bounds.bottom + 8), Math.max(8, window.innerHeight - height - 8)) }
  }
  return { left, bottom: Math.max(8, window.innerHeight - bounds.top + 8) }
}
const goatCounterCode = import.meta.env.VITE_GOATCOUNTER_CODE?.trim() || 'kasu724'
const goatCounterTotalPath = 'TOTAL'
const timeOnSiteStorageKey = 'kasu724-portfolio-time-on-site'
const trackedServices = [
  { key: 'siteCommit', label: 'Deployment commit' },
  { key: 'recentCommits', label: 'Recent commits' },
  { key: 'location', label: 'Location display' },
  { key: 'viewCount', label: 'View counter' },
  { key: 'timeOnSite', label: 'Session timer' },
] as const satisfies ReadonlyArray<{ key: ServiceKey; label: string }>

type GoatCounter = {
  allow_local?: boolean
  no_onload?: boolean
  count?: (variables: { path: string }) => void
}

type GoatCounterWindow = Window & { goatcounter?: GoatCounter }

let goatCounterScriptPromise: Promise<void> | null = null
let goatCounterPageviewSent = false

function deploymentCommitDetails(commit: RecentCommit | null) {
  if (!commit) {
    return {
      summary: 'Loading commit information…',
      additions: '+—',
      deletions: '-—',
    }
  }

  const date = commit.date
    ? deploymentCommitDateFormatter.format(new Date(commit.date))
    : 'Date unavailable'
  const additions = commit.additions?.toLocaleString() ?? '—'
  const deletions = commit.deletions?.toLocaleString() ?? '—'

  return {
    summary: `${commit.message} · ${date}`,
    additions: `+${additions}`,
    deletions: `-${deletions}`,
  }
}

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

function serviceHealthLabel(health: ServiceHealth) {
  if (health === true) return 'Working'
  if (health === false) return 'Has issues'
  return 'Checking'
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
  const { status, setServiceHealth } = useServiceStatus()
  const [timeOnSite, setTimeOnSite] = useState(getStoredTimeOnSite)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [deploymentCommitInfo, setDeploymentCommitInfo] = useState<RecentCommit | null>(() => (
    isDeployedBuild
      ? getCachedRecentCommits().find((commit) => commit.sha === deploymentCommitSha) ?? null
      : null
  ))
  const footerRef = useRef<HTMLElement>(null)
  const [compact, setCompact] = useState(false)
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)
  const [tooltipPlacement, setTooltipPlacement] = useState<FooterTooltipPlacement>({ left: 8, bottom: 64 })
  const activeTooltipRef = useRef<{ trigger: HTMLElement; tooltipId: string } | null>(null)

  const serviceValues = Object.values(status)
  const servicesHealthy = serviceValues.every((health) => health === true)
  const serviceFailed = serviceValues.some((health) => health === false)
  const serviceState = servicesHealthy ? 'nominal' : serviceFailed ? 'degraded' : 'checking'
  const deploymentTooltipDetails = isDeployedBuild
    ? deploymentCommitDetails(deploymentCommitInfo)
    : developmentCommitDetails

  const openTooltipFor = (key: string, tooltipId: string, trigger: HTMLElement) => {
    activeTooltipRef.current = { trigger, tooltipId }
    setTooltipPlacement(getFooterTooltipPlacement(trigger, tooltipId))
    setOpenTooltip(key)
  }

  useLayoutEffect(() => {
    if (!openTooltip || !activeTooltipRef.current) return undefined

    const { trigger, tooltipId } = activeTooltipRef.current
    const tooltip = document.getElementById(tooltipId)
    if (!tooltip) return undefined

    const updatePlacement = () => {
      const next = getFooterTooltipPlacement(trigger, tooltipId)
      setTooltipPlacement((current) => (
        current.left === next.left && current.top === next.top && current.bottom === next.bottom
          ? current
          : next
      ))
    }
    updatePlacement()
    const observer = new ResizeObserver(updatePlacement)
    observer.observe(tooltip)
    observer.observe(trigger)
    return () => observer.disconnect()
  }, [openTooltip])

  useEffect(() => {
    const footer = footerRef.current
    const inner = footer?.querySelector<HTMLElement>('.site-footer__inner')
    const measure = footer?.querySelector<HTMLElement>('.site-footer__measure .site-footer__inner')
    if (!footer || !inner || !measure) return undefined

    const update = () => {
      const next = measure.scrollWidth > inner.clientWidth + 1
      setCompact((current) => (current === next ? current : next))
    }
    const observer = new ResizeObserver(update)
    observer.observe(inner)
    observer.observe(measure)
    void document.fonts?.ready.then(update)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!openTooltip) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenTooltip(null)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest('.site-footer__identity-trigger, .site-footer__status-trigger, .site-footer__metric, .site-footer__commit, .site-footer__social-link')) {
        setOpenTooltip(null)
      }
    }
    const dismissOnViewportChange = () => setOpenTooltip(null)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', dismissOnViewportChange)
    window.addEventListener('scroll', dismissOnViewportChange, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', dismissOnViewportChange)
      window.removeEventListener('scroll', dismissOnViewportChange, true)
    }
  }, [openTooltip])

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
      .then((count) => {
        setViewCount(count)
        setServiceHealth('viewCount', count !== null)
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setViewCount(null)
          setServiceHealth('viewCount', false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [setServiceHealth])

  useEffect(() => {
    if (!isDeployedBuild) return undefined

    let active = true

    void loadDeploymentCommit()
      .then((commit) => {
        if (active) setDeploymentCommitInfo(commit)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  const serviceSummary = servicesHealthy ? 'All Services Nominal' : serviceFailed ? 'Service Issue Detected' : 'Checking Services'
  const serviceTooltipOpen = openTooltip === 'services'
  const duration = formatDuration(timeOnSite)
  const views = viewCount?.toLocaleString() ?? '—'

  return (
    <footer ref={footerRef} className={`site-footer${compact ? ' site-footer--compact' : ''}`}>
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <button type="button" className={`site-footer__identity-trigger${openTooltip === 'identity' ? ' is-tooltip-open' : ''}`} aria-label={`Site by Kevin Lui, ${new Date().getFullYear()}`} aria-describedby="footer-identity-tooltip" aria-expanded={openTooltip === 'identity'} onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('identity', 'footer-identity-tooltip', event.currentTarget) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('identity', 'footer-identity-tooltip', event.currentTarget) }} onBlur={() => setOpenTooltip(null)} onClick={(event) => openTooltipFor('identity', 'footer-identity-tooltip', event.currentTarget)}>
            <span className="site-footer__identity-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 6Zm0 13.1a7.1 7.1 0 0 1-5.3-2.4c.1-2.1 3.5-3.3 5.3-3.3s5.2 1.2 5.3 3.3a7.1 7.1 0 0 1-5.3 2.4Z" /></svg></span>
            <span className="site-footer__identity-label">{new Date().getFullYear()} Kevin Lui</span>
            <span id="footer-identity-tooltip" className="site-footer__value-tooltip" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>Site by Kevin Lui · {new Date().getFullYear()}</span>
          </button>
          <button
            type="button"
            className={`site-footer__status-trigger${serviceTooltipOpen ? ' is-tooltip-open' : ''}`}
            aria-label={`Service status: ${serviceSummary}`}
            aria-describedby="service-status-tooltip"
            aria-expanded={serviceTooltipOpen}
            onClick={(event) => openTooltipFor('services', 'service-status-tooltip', event.currentTarget)}
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('services', 'service-status-tooltip', event.currentTarget) }}
            onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }}
            onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('services', 'service-status-tooltip', event.currentTarget) }}
            onBlur={() => setOpenTooltip(null)}
          >
            <span className={`site-footer__status site-footer__status--${serviceState}`} role="status" aria-live="polite">
              <span className="site-footer__status-dot" aria-hidden="true" />
              <span className="site-footer__status-label">{serviceSummary}</span>
            </span>
            <span id="service-status-tooltip" className="site-footer__status-tooltip" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>
              <span className="site-footer__status-tooltip-title">Tracked Services</span>
              <span className="site-footer__status-summary">{serviceSummary}</span>
              <span className="site-footer__status-list" role="list">
                {trackedServices.map(({ key, label }) => {
                  const health = status[key]
                  return (
                    <span className="site-footer__status-item" role="listitem" key={key}>
                      <span>{label}</span>
                      <span className={`site-footer__service-health site-footer__service-health--${health === true ? 'working' : health === false ? 'issues' : 'checking'}`}>
                        <span className="site-footer__service-health-dot" aria-hidden="true" />
                        {serviceHealthLabel(health)}
                      </span>
                      {key === 'viewCount' && health === false && <span className="site-footer__service-note">ad blocker may affect availability</span>}
                    </span>
                  )
                })}
              </span>
            </span>
          </button>
        </div>

        <div className="site-footer__details">
          <button type="button" className={`site-footer__metric site-footer__tooltip${openTooltip === 'time' ? ' is-tooltip-open' : ''}`} aria-label={`Time on site: ${duration}`} aria-describedby="footer-time-tooltip" onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('time', 'footer-time-tooltip', event.currentTarget) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('time', 'footer-time-tooltip', event.currentTarget) }} onBlur={() => setOpenTooltip(null)} onClick={(event) => openTooltipFor('time', 'footer-time-tooltip', event.currentTarget)}>
            <span className="site-footer__icon site-footer__clock-icon" aria-hidden="true"><ClockIcon /></span><span className="site-footer__metric-label"><span className="sr-only">Time on site: </span>{duration}</span>
            <span id="footer-time-tooltip" className="site-footer__value-tooltip" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>Time on site: {duration}</span>
          </button>
          <button type="button" className={`site-footer__metric site-footer__tooltip${openTooltip === 'views' ? ' is-tooltip-open' : ''}`} aria-label={`Site views: ${views}`} aria-describedby="footer-views-tooltip" onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('views', 'footer-views-tooltip', event.currentTarget) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('views', 'footer-views-tooltip', event.currentTarget) }} onBlur={() => setOpenTooltip(null)} onClick={(event) => openTooltipFor('views', 'footer-views-tooltip', event.currentTarget)}>
            <span className="site-footer__icon" aria-hidden="true"><EyeIcon /></span><span className="site-footer__metric-label"><span className="sr-only">Site views: </span>{views} views</span>
            <span id="footer-views-tooltip" className="site-footer__value-tooltip" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>Site views: {views}</span>
          </button>
          <a className={`site-footer__commit site-footer__tooltip site-footer__tooltip--detail${openTooltip === 'commit' ? ' is-tooltip-open' : ''}`} href={deploymentCommitUrl ?? '#'} target={deploymentCommitUrl ? '_blank' : undefined} rel={deploymentCommitUrl ? 'noreferrer' : undefined} aria-label={`Deployment commit ${deploymentCommit}${deploymentCommitUrl ? ', open commit on GitHub' : ''}`} aria-describedby="footer-commit-tooltip" onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('commit', 'footer-commit-tooltip', event.currentTarget) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('commit', 'footer-commit-tooltip', event.currentTarget) }} onBlur={() => setOpenTooltip(null)} onClick={(event) => { if (!deploymentCommitUrl || (compact && event.detail > 0 && openTooltip !== 'commit')) { event.preventDefault(); openTooltipFor('commit', 'footer-commit-tooltip', event.currentTarget) } }}>
            <span className="site-footer__icon" aria-hidden="true"><CommitIcon /></span><span className="site-footer__metric-label"><span className="sr-only">Deployment commit: </span>{deploymentCommit}</span>
            <span id="footer-commit-tooltip" className="site-footer__tooltip-detail" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>
              <span>{deploymentCommitUrl ? 'Current deployment commit' : 'Development environment'}</span>
              <span>SHA: {deploymentCommit}</span>
              <span>{deploymentTooltipDetails.summary} · <span className="site-footer__tooltip-additions">{deploymentTooltipDetails.additions}</span>{' / '}<span className="site-footer__tooltip-deletions">{deploymentTooltipDetails.deletions}</span></span>
            </span>
          </a>
          <a className={`site-footer__social-link site-footer__tooltip${openTooltip === 'github' ? ' is-tooltip-open' : ''}`} href={socialLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub profile" aria-describedby="footer-github-tooltip" onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('github', 'footer-github-tooltip', event.currentTarget) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('github', 'footer-github-tooltip', event.currentTarget) }} onBlur={() => setOpenTooltip(null)} onClick={(event) => { if (compact && event.detail > 0 && openTooltip !== 'github') { event.preventDefault(); openTooltipFor('github', 'footer-github-tooltip', event.currentTarget) } }}><GithubIcon /><span id="footer-github-tooltip" className="site-footer__value-tooltip" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>GitHub profile · Open profile</span></a>
          <a className={`site-footer__social-link site-footer__tooltip${openTooltip === 'linkedin' ? ' is-tooltip-open' : ''}`} href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" aria-describedby="footer-linkedin-tooltip" onPointerEnter={(event) => { if (event.pointerType === 'mouse') openTooltipFor('linkedin', 'footer-linkedin-tooltip', event.currentTarget) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus')) setOpenTooltip(null) }} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) openTooltipFor('linkedin', 'footer-linkedin-tooltip', event.currentTarget) }} onBlur={() => setOpenTooltip(null)} onClick={(event) => { if (compact && event.detail > 0 && openTooltip !== 'linkedin') { event.preventDefault(); openTooltipFor('linkedin', 'footer-linkedin-tooltip', event.currentTarget) } }}><LinkedinIcon /><span id="footer-linkedin-tooltip" className="site-footer__value-tooltip" role="tooltip" style={{ left: tooltipPlacement.left, bottom: tooltipPlacement.bottom, top: tooltipPlacement.top }}>LinkedIn profile · Open profile</span></a>
        </div>
      </div>
      <div className="site-footer__measure" aria-hidden="true">
        <div className="site-footer__inner">
          <div className="site-footer__identity"><span>{new Date().getFullYear()} Kevin Lui</span><span className={`site-footer__status site-footer__status--${serviceState}`}><span className="site-footer__status-dot" />{serviceSummary}</span></div>
          <div className="site-footer__details">
            <span className="site-footer__metric"><span className="site-footer__icon"><ClockIcon /></span>{duration}</span>
            <span className="site-footer__metric"><span className="site-footer__icon"><EyeIcon /></span>{views} views</span>
            <span className="site-footer__commit"><span className="site-footer__icon"><CommitIcon /></span>{deploymentCommit}</span>
            <span className="site-footer__social-link"><GithubIcon /></span><span className="site-footer__social-link"><LinkedinIcon /></span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
