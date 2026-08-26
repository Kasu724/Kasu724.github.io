import { useRef } from 'react'
import type { Project } from '../types/project'

type ProjectCardProps = {
  project: Project
  onOpen: (origin: HTMLElement, trigger: HTMLButtonElement) => void
  isOpen?: boolean
  isClosing?: boolean
}

type ProjectCardContentProps = {
  project: Project
  showLinks?: boolean
}

type ProjectLinksProps = {
  project: Project
  className?: string
}

export function ProjectLinks({ project, className = '' }: ProjectLinksProps) {
  if (!project.liveUrl && !project.sourceUrl) return null

  return (
    <p className={`project-card__links${className ? ` ${className}` : ''}`}>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer">View project</a>
      )}
      {project.liveUrl && project.sourceUrl && <span aria-hidden="true">/</span>}
      {project.sourceUrl && (
        <a href={project.sourceUrl} target="_blank" rel="noreferrer">View source</a>
      )}
    </p>
  )
}

export function ProjectCardContent({ project, showLinks = true }: ProjectCardContentProps) {
  return (
    <>
      <h3>{project.title}</h3>
      <p className="project-card__description">{project.description}</p>

      <div className="project-card__technologies">
        <h4>Technologies</h4>
        <ul>
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>

      {showLinks && <ProjectLinks project={project} />}
    </>
  )
}

function ProjectCard({ project, onOpen, isOpen = false, isClosing = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  return (
    <article
      ref={cardRef}
      className={`project-card${isOpen ? isClosing ? ' project-card--returning' : ' project-card--hidden' : ''}`}
      aria-hidden={isOpen}
      inert={isOpen || undefined}
    >
      <button
        className="project-card__open"
        type="button"
        tabIndex={isOpen ? -1 : 0}
        aria-label={`Open details for ${project.title}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={(event) => onOpen(cardRef.current ?? event.currentTarget, event.currentTarget)}
      />
      <div className="project-card__content">
        <ProjectCardContent project={project} showLinks={false} />
      </div>
      <ProjectLinks project={project} />
    </article>
  )
}

export default ProjectCard
