import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { useServiceStatus } from './useServiceStatus'

const hobokenCoordinates: [number, number] = [40.74325, -74.0324]
const mapZoom = 15  

function MapPinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
}

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
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(getHobokenTime)

  useEffect(() => {
    let destroyed = false
    const interval = window.setInterval(() => setCurrentTime(getHobokenTime()), 1000)

    async function initializeMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (destroyed || !mapContainerRef.current) return

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        touchZoom: true,
      }).setView(hobokenCoordinates, mapZoom)

      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '',
        keepBuffer: 4,
        updateWhenIdle: false,
        updateWhenZooming: false,
      })
      tileLayer.on('tileerror', () => setServiceHealth('location', false))
      tileLayer.addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
      setServiceHealth('location', true)
    }

    void initializeMap().catch(() => {
      setServiceHealth('location', false)
    })

    return () => {
      destroyed = true
      window.clearInterval(interval)
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [setServiceHealth])

  const hour = Number(currentTime.split(':')[0])
  const isDaytime = hour >= 6 && hour < 21

  function recenterMap() {
    mapInstanceRef.current?.setView(hobokenCoordinates, mapZoom)
  }

  return (
    <article className="contact-card contact-card--location">
      <button className="contact-card__heading contact-card__heading--button" type="button" onClick={recenterMap}>
        <span className="contact-card__icon"><MapPinIcon /></span>
        <h3>Location</h3>
      </button>

      <div className="contact-card__map">
        <div className="contact-card__map-canvas" ref={mapContainerRef} />
        {!mapLoaded && <div className="contact-card__map-loading">Loading map…</div>}
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
