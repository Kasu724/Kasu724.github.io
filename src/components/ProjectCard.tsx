import type { Project } from '../types/project'

type ProjectCardProps = {
  project: Project
  onOpen: () => void
}

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  function handleClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a, button')) return
    onOpen()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <article
      className="project-card"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
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

      {(project.liveUrl || project.sourceUrl) && (
        <p className="project-card__links">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer">View project</a>
          )}
          {project.liveUrl && project.sourceUrl && <span aria-hidden="true">/</span>}
          {project.sourceUrl && (
            <a href={project.sourceUrl} target="_blank" rel="noreferrer">View source</a>
          )}
        </p>
      )}
    </article>
  )
}

export default ProjectCard
