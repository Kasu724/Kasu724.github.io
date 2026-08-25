import { useEffect, useId, useRef, useState } from 'react'
import { formatFoodPhotoDate, groupFoodPhotosByMonth } from '../data/foodPhotos'
import type { DisplayableFoodPhoto } from '../types/food'

type FoodPhotoSummaryProps = {
  photo: DisplayableFoodPhoto
  id?: string
  className?: string
  role?: 'tooltip'
}

function FoodPhotoSummary({ photo, id, className = '', role }: FoodPhotoSummaryProps) {
  const formattedDate = formatFoodPhotoDate(photo.date)

  return (
    <span id={id} role={role} className={`food-photo-summary${className ? ` ${className}` : ''}`}>
      <span className="food-photo-summary__header">
        <span className="food-photo-summary__venue">
          {photo.restaurant && <strong>{photo.restaurant}</strong>}
          {photo.location && <span>{photo.location}</span>}
        </span>
        <time dateTime={photo.date}>{formattedDate}</time>
      </span>
      {photo.caption && <span className="food-photo-summary__description">{photo.caption}</span>}
    </span>
  )
}

type FoodPhotoCardProps = {
  photo: DisplayableFoodPhoto
  onOpen: (origin: HTMLButtonElement) => void
}

function FoodPhotoCard({ photo, onOpen }: FoodPhotoCardProps) {
  const tooltipId = useId()
  const formattedDate = formatFoodPhotoDate(photo.date)
  const imageAlt = photo.alt?.trim()
    || photo.caption?.trim()
    || `Food photographed on ${formattedDate}`

  return (
    <button
      className="food-photo-card"
      type="button"
      aria-label={`Open food photo from ${formattedDate}`}
      aria-describedby={tooltipId}
      aria-haspopup="dialog"
      onClick={(event) => onOpen(event.currentTarget)}
    >
      <span className="food-photo-card__image-wrap">
        <img src={photo.src} alt={imageAlt} loading="lazy" decoding="async" />
      </span>
      <FoodPhotoSummary
        photo={photo}
        id={tooltipId}
        className="food-photo-card__tooltip"
        role="tooltip"
      />
    </button>
  )
}

type FoodPhotoDialogProps = {
  photo: DisplayableFoodPhoto
  isClosing: boolean
  onClose: () => void
  onExitComplete: () => void
}

function FoodPhotoDialog({ photo, isClosing, onClose, onExitComplete }: FoodPhotoDialogProps) {
  const titleId = useId()
  const metadataId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const imageAlt = photo.alt?.trim()
    || photo.caption?.trim()
    || `Food photographed on ${formatFoodPhotoDate(photo.date)}`

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div
      className="food-dialog-backdrop"
      data-closing={isClosing || undefined}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="food-dialog"
        data-closing={isClosing || undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={metadataId}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            event.preventDefault()
            closeButtonRef.current?.focus()
          }
        }}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget
            && isClosing
            && event.animationName === 'food-dialog-out'
          ) {
            onExitComplete()
          }
        }}
      >
        <h2 id={titleId} className="sr-only">
          {photo.caption ?? photo.restaurant ?? `Food photo from ${formatFoodPhotoDate(photo.date)}`}
        </h2>
        <button
          ref={closeButtonRef}
          className="food-dialog__close"
          type="button"
          aria-label="Close food photo"
          onClick={onClose}
        >
          ×
        </button>

        <div className="food-dialog__image-wrap">
          <img src={photo.src} alt={imageAlt} />
        </div>

        <div className="food-dialog__details">
          <FoodPhotoSummary photo={photo} id={metadataId} className="food-dialog__summary" />
        </div>
      </section>
    </div>
  )
}

function FoodGallery() {
  const groups = groupFoodPhotosByMonth()
  const [selectedPhoto, setSelectedPhoto] = useState<DisplayableFoodPhoto | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selectedPhoto) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsClosing(true)
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedPhoto])

  function openPhoto(photo: DisplayableFoodPhoto, origin: HTMLButtonElement) {
    previouslyFocusedElement.current = origin
    setIsClosing(false)
    setSelectedPhoto(photo)
  }

  function closePhoto() {
    if (!selectedPhoto || isClosing) return
    setIsClosing(true)
  }

  function finishClosing() {
    setSelectedPhoto(null)
    setIsClosing(false)
    previouslyFocusedElement.current?.focus()
    previouslyFocusedElement.current = null
  }

  if (groups.length === 0) {
    return (
      <p className="food-gallery__empty">
        No food photos have been added yet.
      </p>
    )
  }

  return (
    <div className="food-gallery">
      {groups.map((group) => {
        const headingId = `food-month-${group.key}`

        return (
          <section className="food-month" key={group.key} aria-labelledby={headingId}>
            <h2 id={headingId}>{group.label}</h2>
            <div className="food-month__grid">
              {group.photos.map((photo) => (
                <FoodPhotoCard
                  key={`${photo.date}-${photo.src}`}
                  photo={photo}
                  onOpen={(origin) => openPhoto(photo, origin)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {selectedPhoto && (
        <FoodPhotoDialog
          photo={selectedPhoto}
          isClosing={isClosing}
          onClose={closePhoto}
          onExitComplete={finishClosing}
        />
      )}
    </div>
  )
}

export default FoodGallery
