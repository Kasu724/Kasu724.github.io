import { useEffect, useEffectEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DialogBackdropProps = {
  children: ReactNode
  className: string
  isClosing: boolean
  onClose: () => void
}

export default function DialogBackdrop({ children, className, isClosing, onClose }: DialogBackdropProps) {
  const closeFromKeyboard = useEffectEvent(onClose)

  useEffect(() => {
    const pageRoot = document.getElementById('top')
    const bodyStyle = document.body.style
    const previousOverflow = bodyStyle.overflow
    const previousPaddingRight = bodyStyle.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    pageRoot?.classList.add('dialog-page--blurred')
    bodyStyle.overflow = 'hidden'
    if (scrollbarWidth > 0) bodyStyle.paddingRight = `${scrollbarWidth}px`

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeFromKeyboard()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      pageRoot?.classList.remove('dialog-page--blurred', 'dialog-page--closing')
      bodyStyle.overflow = previousOverflow
      bodyStyle.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    document.getElementById('top')?.classList.toggle('dialog-page--closing', isClosing)
  }, [isClosing])

  return createPortal(
    <div
      className={`dialog-backdrop ${className}`}
      data-closing={isClosing || undefined}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {children}
    </div>,
    document.body,
  )
}
