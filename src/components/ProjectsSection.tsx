import { useEffect, useId, useRef, useState } from 'react'
import { projects } from '../data/projects'
import type { Project } from '../types/project'
import ProjectCard from './ProjectCard'

function renderHighlight(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const isBold = part.startsWith('**') && part.endsWith('**')

    return isBold ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong> : part
  })
}

type ProjectDialogProps = {
  project: Project
  onClose: () => void
}

export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  const highlights = project.highlights?.length ? project.highlights : [project.description]

  return (
    <div
      className="project-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="project-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
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
        <ul className="experience-entry__highlights project-dialog__highlights">
          {highlights.map((highlight) => (
            <li key={highlight}>{renderHighlight(highlight)}</li>
          ))}
        </ul>
        {project.liveUrl || project.sourceUrl ? (
          <p className="project-card__links project-dialog__links">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer">View project</a>
            )}
            {project.liveUrl && project.sourceUrl && <span aria-hidden="true">/</span>}
            {project.sourceUrl && (
              <a href={project.sourceUrl} target="_blank" rel="noreferrer">View source</a>
            )}
          </p>
        ) : null}
      </section>
    </div>
  )
}

function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selectedProject) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedProject(null)
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedProject])

  function openProject(project: Project) {
    previouslyFocusedElement.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    setSelectedProject(project)
  }

  function closeProject() {
    setSelectedProject(null)
    previouslyFocusedElement.current?.focus()
    previouslyFocusedElement.current = null
  }

  return (
    <section
      className="content-section projects-section"
      id="projects"
      aria-labelledby="projects-title"
    >
      <h2 id="projects-title">Projects</h2>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} onOpen={() => openProject(project)} />
        ))}
      </div>

      {selectedProject && <ProjectDialog project={selectedProject} onClose={closeProject} />}
    </section>
  )
}

export default ProjectsSection
