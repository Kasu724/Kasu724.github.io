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

function getInitialPalette(): PaletteName {
  const storedPalette = localStorage.getItem('palette')

  if (isPaletteName(storedPalette)) {
    return storedPalette
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'latte'
    : 'mocha'
}

function getInitialAccent(): AccentName {
  const storedAccent = localStorage.getItem('accent')
  return isAccentName(storedAccent) ? storedAccent : 'peach'
}

function ThemeMenu() {
  const [palette, setPalette] = useState<PaletteName>(getInitialPalette)
  const [accent, setAccent] = useState<AccentName>(getInitialAccent)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = palette
    localStorage.setItem('palette', palette)
  }, [palette])

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--color-accent',
      `var(--accent-${accent})`,
    )
    localStorage.setItem('accent', accent)
  }, [accent])

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
                aria-pressed={accent === name}
                className={accent === name ? 'is-selected' : undefined}
                key={name}
                onClick={() => setAccent(name)}
                style={{ backgroundColor: `var(--accent-${name})` }}
                title={name.charAt(0).toUpperCase() + name.slice(1)}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </details>
  )
}

export default ThemeMenu
