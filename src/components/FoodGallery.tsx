import { useEffect, useId, useRef, useState } from 'react'
import { formatFoodPhotoDate, groupFoodPhotosByMonth } from '../data/foodPhotos'
import type { DisplayableFoodPhoto, FoodPhotoGroup } from '../types/food'

const thumbnailWidths = [400, 800] as const
const initialVisiblePhotoCount = 24
const photoBatchSize = 24

function applyImageFallback(image: HTMLImageElement, fallbackSource: string) {
  const fallbackUrl = new URL(fallbackSource, document.baseURI).href

  // The DOM resolves `image.src` to an absolute URL, even when React received a
  // relative URL. Comparing the raw prop to `image.src` can therefore retry the
  // same broken image forever.
  if (image.src === fallbackUrl) {
    image.onerror = null
    return
  }

  image.srcset = ''
  image.src = fallbackSource
}

function getFoodThumbnailSource(source: string, width: typeof thumbnailWidths[number]) {
  const originalsMarker = '/originals/'
  const markerIndex = source.indexOf(originalsMarker)

  if (markerIndex === -1) return source

  const sourcePrefix = source.slice(0, markerIndex)
  const objectKey = source.slice(markerIndex + originalsMarker.length)
  return `${sourcePrefix}/thumbnails/${width}w/${objectKey}.webp`
}

function getVisibleFoodPhotoGroups(groups: FoodPhotoGroup[], maximumPhotoCount: number) {
  let remainingPhotoCount = maximumPhotoCount

  return groups.flatMap((group) => {
    const photos = group.photos.slice(0, remainingPhotoCount)
    remainingPhotoCount -= photos.length
    return photos.length > 0 ? [{ ...group, photos }] : []
  })
}

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
  priority?: boolean
  onOpen: (origin: HTMLButtonElement) => void
}

function FoodPhotoCard({ photo, priority = false, onOpen }: FoodPhotoCardProps) {
  const tooltipId = useId()
  const formattedDate = formatFoodPhotoDate(photo.date)
  const thumbnailSource = getFoodThumbnailSource(photo.src, 800)
  const thumbnailSourceSet = thumbnailWidths
    .map((width) => `${getFoodThumbnailSource(photo.src, width)} ${width}w`)
    .join(', ')
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
        <img
          src={thumbnailSource}
          srcSet={thumbnailSourceSet}
          sizes="(max-width: 40rem) calc(100vw - 2rem), (max-width: 64rem) calc(50vw - 2rem), 24rem"
          width="800"
          height="600"
          alt={imageAlt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={(event) => {
            applyImageFallback(event.currentTarget, photo.src)
          }}
        />
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
  const thumbnailSource = getFoodThumbnailSource(photo.src, 800)
  const dialogTitle = photo.caption?.trim()
    || photo.restaurant?.trim()
    || `Food photo from ${formatFoodPhotoDate(photo.date)}`
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
          {dialogTitle}
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
          <img
            src={photo.src}
            alt={imageAlt}
            onError={(event) => {
              applyImageFallback(event.currentTarget, thumbnailSource)
            }}
          />
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
  const totalPhotoCount = groups.reduce((count, group) => count + group.photos.length, 0)
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(initialVisiblePhotoCount)
  const [selectedPhoto, setSelectedPhoto] = useState<DisplayableFoodPhoto | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const loadMoreRef = useRef<HTMLButtonElement | null>(null)
  const visibleGroups = getVisibleFoodPhotoGroups(groups, visiblePhotoCount)
  const hasMorePhotos = visiblePhotoCount < totalPhotoCount

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current

    if (!loadMoreElement || !hasMorePhotos || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return

      setVisiblePhotoCount((currentCount) => (
        Math.min(currentCount + photoBatchSize, totalPhotoCount)
      ))
    }, { rootMargin: '600px 0px' })

    observer.observe(loadMoreElement)
    return () => observer.disconnect()
  }, [hasMorePhotos, totalPhotoCount])

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
      {visibleGroups.map((group, groupIndex) => {
        const headingId = `food-month-${group.key}`

        return (
          <section className="food-month" key={group.key} aria-labelledby={headingId}>
            <h2 id={headingId}>{group.label}</h2>
            <div className="food-month__grid">
              {group.photos.map((photo, photoIndex) => (
                <FoodPhotoCard
                  key={`${photo.date}-${photo.src}`}
                  photo={photo}
                  priority={groupIndex === 0 && photoIndex < 3}
                  onOpen={(origin) => openPhoto(photo, origin)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {hasMorePhotos && (
        <div className="food-gallery__load-more">
          <button
            ref={loadMoreRef}
            type="button"
            onClick={() => {
              setVisiblePhotoCount((currentCount) => (
                Math.min(currentCount + photoBatchSize, totalPhotoCount)
              ))
            }}
          >
            Load more photos
          </button>
        </div>
      )}

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
