import { useLayoutEffect, useState } from 'react'

const paletteNames = ['latte', 'frappe', 'macchiato', 'mocha'] as const
const accentNames = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
] as const

type PaletteName = (typeof paletteNames)[number]
type AccentName = (typeof accentNames)[number]

const paletteLabels: Record<PaletteName, string> = {
  latte: 'Latte',
  frappe: 'Frappé',
  macchiato: 'Macchiato',
  mocha: 'Mocha',
}

function isPaletteName(value: string | null): value is PaletteName {
  return paletteNames.includes(value as PaletteName)
}

function isAccentName(value: string | null): value is AccentName {
  return accentNames.includes(value as AccentName)
}

function readPreference(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Preferences still apply for the current page when storage is unavailable.
  }
}

function getInitialPalette(): PaletteName {
  const storedPalette = readPreference('palette')

  if (isPaletteName(storedPalette)) {
    return storedPalette
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'latte'
    : 'mocha'
}

function getInitialAccent(): AccentName {
  const storedAccent = readPreference('accent')
  return isAccentName(storedAccent) ? storedAccent : 'peach'
}

function updateFavicon(accent: AccentName) {
  const styles = getComputedStyle(document.documentElement)
  const background = styles.getPropertyValue('--ctp-base').trim()
  const lettering = styles.getPropertyValue(`--ctp-${accent}`).trim()
  const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')

  if (!favicon || !background || !lettering) return

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="${background}"/>
    <g fill="${lettering}" transform="translate(8.459 45.87) scale(.038 -.038)">
      <path d="M80 0V730H205V334H292L426 550H566L400 284L569 0H426L292 228H205V0Z"/>
      <path d="M384 0Q330 0 289.5 22Q249 44 226 84.5Q203 125 203 178V617H27V730H328V178Q328 148 345.5 130.5Q363 113 393 113H559V0Z" transform="translate(600)"/>
    </g>
  </svg>`

  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function ThemeMenu() {
  const [palette, setPalette] = useState<PaletteName>(getInitialPalette)
  const [accent, setAccent] = useState<AccentName>(getInitialAccent)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = palette
    writePreference('palette', palette)
  }, [palette])

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--color-accent',
      `var(--accent-${accent})`,
    )
    writePreference('accent', accent)
  }, [accent])

  useLayoutEffect(() => {
    updateFavicon(accent)
  }, [palette, accent])

  return (
    <details className="theme-menu">
      <summary>Theme</summary>

      <div className="theme-menu__panel">
        <fieldset className="theme-menu__palettes">
          <legend>Palette</legend>
          <div>
            {paletteNames.map((name) => (
              <button
                type="button"
                aria-pressed={palette === name}
                key={name}
                onClick={() => setPalette(name)}
              >
                {paletteLabels[name]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="theme-menu__accents">
          <legend>Accent color</legend>
          <div>
            {accentNames.map((name) => (
              <button
                type="button"
                aria-label={`Select ${name} accent color`}
                aria-describedby={`theme-accent-${name}-tooltip`}
                aria-pressed={accent === name}
                className={accent === name ? 'is-selected' : undefined}
                key={name}
                onClick={() => setAccent(name)}
                style={{ backgroundColor: `var(--accent-${name})` }}
              >
                <span
                  className="theme-menu__accent-tooltip"
                  id={`theme-accent-${name}-tooltip`}
                  role="tooltip"
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </details>
  )
}

export default ThemeMenu
