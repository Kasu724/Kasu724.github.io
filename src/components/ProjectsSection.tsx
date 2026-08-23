import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { featuredProjects } from '../data/projects'
import type { Project } from '../types/project'
import ProjectCard, { ProjectCardContent, ProjectLinks } from './ProjectCard'

function renderHighlight(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const isBold = part.startsWith('**') && part.endsWith('**')

    return isBold ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong> : part
  })
}

type ProjectDialogProps = {
  project: Project
  onClose: () => void
  onExitComplete: () => void
  origin: { left: number; top: number; width: number; height: number }
  isClosing: boolean
}

export function ProjectDialog({ project, onClose, onExitComplete, origin, isClosing }: ProjectDialogProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const [dialogGeometry, setDialogGeometry] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [contentScale, setContentScale] = useState(1)
  const [isPositioned, setIsPositioned] = useState(false)
  const [isOpenComplete, setIsOpenComplete] = useState(false)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    if (!dialogRef.current) return

    const dialogBounds = dialogRef.current.getBoundingClientRect()
    const nextContentScale = origin.width > 0 ? dialogBounds.width / origin.width : 1

    if (Math.abs(nextContentScale - contentScale) > 0.001) {
      setContentScale(nextContentScale)
      return
    }

    setDialogGeometry({
      left: dialogBounds.left,
      top: dialogBounds.top,
      width: dialogBounds.width,
      height: dialogBounds.height,
    })
    setIsPositioned(true)
  }, [contentScale, origin])

  const highlights = project.highlights?.length ? project.highlights : [project.description]

  return (
    <div
      className="project-dialog-backdrop"
      data-closing={isClosing || undefined}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className={`project-dialog${isPositioned ? ' project-dialog--positioned' : ''}`}
        data-closing={isClosing || undefined}
        data-open-complete={!isClosing && isOpenComplete || undefined}
        style={{
          '--project-dialog-origin-left': `${origin.left}px`,
          '--project-dialog-origin-top': `${origin.top}px`,
          '--project-dialog-origin-width': `${origin.width}px`,
          '--project-dialog-origin-height': `${origin.height}px`,
          '--project-dialog-target-left': `${dialogGeometry.left}px`,
          '--project-dialog-target-top': `${dialogGeometry.top}px`,
          '--project-dialog-target-width': `${dialogGeometry.width}px`,
          '--project-dialog-target-height': `${dialogGeometry.height}px`,
          '--project-dialog-expanded-scale': contentScale,
        } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={(event) => {
          if (isClosing && event.animationName === 'project-dialog-close') onExitComplete()
          if (!isClosing && event.animationName === 'project-dialog-open') setIsOpenComplete(true)
        }}
      >
        <div className="project-dialog__content-stack">
          <div className="project-dialog__content project-dialog__content--expanded">
            <button
              ref={closeButtonRef}
              className="project-dialog__close"
              type="button"
              aria-label="Close project details"
              onClick={onClose}
            >
              ×
            </button>
            <h3 id={titleId}>{project.title}</h3>
            <p className="project-dialog__description">{project.description}</p>
            <div className="project-card__technologies project-dialog__technologies">
              <h4>Technologies</h4>
              <ul>
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
            <div className="project-dialog__highlights-reveal">
              <ul className="experience-entry__highlights project-dialog__highlights">
                {highlights.map((highlight) => (
                  <li key={highlight}>{renderHighlight(highlight)}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="project-dialog__content project-dialog__content--compact" aria-hidden="true" inert>
            <ProjectCardContent project={project} showLinks={false} />
          </div>
        </div>
        <ProjectLinks project={project} className="project-dialog__links" />
      </section>
    </div>
  )
}

function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogOrigin, setDialogOrigin] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [isClosing, setIsClosing] = useState(false)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selectedProject) return

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
  }, [selectedProject])

  function openProject(project: Project, origin: HTMLElement) {
    const bounds = origin.getBoundingClientRect()
    const nextOrigin = {
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    }
    previouslyFocusedElement.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    setDialogOrigin(nextOrigin)
    setIsClosing(false)
    setSelectedProject(project)
  }

  function closeProject() {
    if (!selectedProject || isClosing) return

    setIsClosing(true)
  }

  function finishClosing() {
    setSelectedProject(null)
    setIsClosing(false)
    setDialogOrigin({ left: 0, top: 0, width: 0, height: 0 })
    previouslyFocusedElement.current?.focus()
    previouslyFocusedElement.current = null
  }

  return (
    <section
      className="content-section projects-section"
      id="projects"
      aria-labelledby="projects-title"
    >
      <h2 id="projects-title">Featured Projects</h2>

      <div className="projects-grid">
        {featuredProjects.map((project) => (
          <ProjectCard
            key={project.title}
            project={project}
            isOpen={selectedProject?.title === project.title}
            isClosing={selectedProject?.title === project.title && isClosing}
            onOpen={(origin) => openProject(project, origin)}
          />
        ))}
      </div>

      <div className="projects-section__all">
        <a href="/projects/">See all projects</a>
      </div>

      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          origin={dialogOrigin}
          isClosing={isClosing}
          onClose={closeProject}
          onExitComplete={finishClosing}
        />
      )}
    </section>
  )
}

export default ProjectsSection
