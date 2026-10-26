import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { MapPinIcon } from './ServiceIcons'
import { useServiceStatus } from './useServiceStatus'

const hobokenCoordinates: [number, number] = [40.74325, -74.0324]
// Show the city and waterfront; CARTO switches to neighborhood labels at z14.
const mapZoom = 13

function SunIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg>
}

function MoonIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>
}

function getHobokenTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

function LocationMap() {
  const { setServiceHealth } = useServiceStatus()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [currentTime, setCurrentTime] = useState(getHobokenTime)

  useEffect(() => {
    let destroyed = false
    let resizeObserver: ResizeObserver | undefined
    const interval = window.setInterval(() => setCurrentTime(getHobokenTime()), 1000)

    async function initializeMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (destroyed || !mapContainerRef.current) return

      const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY?.trim()

      if (!cartoApiKey) {
        throw new Error('VITE_CARTO_API_KEY is not configured')
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        zoomSnap: 0.1,
        zoomDelta: 0.1,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        touchZoom: true,
      }).setView(hobokenCoordinates, mapZoom)
      mapInstanceRef.current = map

      map.createPane('labels')

      // Keep labels separate so theme filters cannot wash out their contrast.
      // CARTO's @2x variant adds resolution without changing the 256px tile grid.
      const tileLayers = [
        ['dark_nolabels', 'tilePane', 'contact-card__map-base'],
        ['dark_only_labels', 'labels', 'contact-card__map-labels'],
      ].map(([style, pane, className]) => L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoApiKey)}`,
        {
          pane,
          className,
          maxZoom: 19,
          detectRetina: false,
          attribution: pane === 'tilePane'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '',
          subdomains: 'abcd',
          keepBuffer: 4,
          updateWhenIdle: false,
          updateWhenZooming: false,
        },
      ))
      const pendingLayers = new Set(tileLayers)
      const failedLayers = new Set<(typeof tileLayers)[number]>()

      for (const layer of tileLayers) {
        layer.on('loading', () => {
          pendingLayers.add(layer)
          failedLayers.delete(layer)
        })
        layer.on('tileerror', () => {
          failedLayers.add(layer)
          setMapStatus('error')
          setServiceHealth('location', false)
        })
        layer.on('load', () => {
          pendingLayers.delete(layer)
          if (pendingLayers.size > 0) return

          const healthy = failedLayers.size === 0
          setMapStatus(healthy ? 'ready' : 'error')
          setServiceHealth('location', healthy)
        })
        layer.addTo(map)
      }

      // Grid content and fonts can resize the card without a window resize.
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize({ animate: false, debounceMoveend: true })
      })
      resizeObserver.observe(mapContainerRef.current)
    }

    void initializeMap().catch(() => {
      if (destroyed) return
      setMapStatus('error')
      setServiceHealth('location', false)
    })

    return () => {
      destroyed = true
      window.clearInterval(interval)
      resizeObserver?.disconnect()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [setServiceHealth])

  const hour = Number(currentTime.split(':')[0])
  const isDaytime = hour >= 6 && hour < 21

  function recenterMap() {
    mapInstanceRef.current?.invalidateSize({ animate: false })
    mapInstanceRef.current?.setView(hobokenCoordinates, mapZoom)
  }

  return (
    <article className="contact-card contact-card--location">
      <button className="contact-card__heading contact-card__heading--button" type="button" onClick={recenterMap}>
        <span className="contact-card__icon"><MapPinIcon /></span>
        <h3>Location</h3>
      </button>

      <div className="contact-card__map">
        <div
          aria-label="Interactive map centered on Hoboken, New Jersey"
          className="contact-card__map-canvas"
          ref={mapContainerRef}
          role="region"
        />
        {mapStatus !== 'ready' && (
          <div className="contact-card__map-loading" role="status">
            {mapStatus === 'error' ? 'Map temporarily unavailable.' : 'Loading map…'}
          </div>
        )}
      </div>

      <div className="contact-card__location-details">
        <button className="contact-card__place" type="button" onClick={recenterMap}>Hoboken, NJ</button>
        <div className="contact-card__clock">
          <span className={isDaytime ? 'contact-card__sun' : 'contact-card__moon'}>
            {isDaytime ? <SunIcon /> : <MoonIcon />}
          </span>
          <time>{currentTime}</time>
        </div>
      </div>
    </article>
  )
}

export default LocationMap
