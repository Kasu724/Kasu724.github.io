import type { Project } from '../types/project'

type ProjectCardProps = {
  project: Project
  onOpen: (origin: HTMLElement) => void
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
  function handleClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a, button')) return
    onOpen(event.currentTarget)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(event.currentTarget)
    }
  }

  return (
    <article
      className={`project-card${isOpen ? isClosing ? ' project-card--returning' : ' project-card--hidden' : ''}`}
      role="button"
      tabIndex={isOpen ? -1 : 0}
      aria-hidden={isOpen}
      aria-haspopup="dialog"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <ProjectCardContent project={project} />
    </article>
  )
}

export default ProjectCard
