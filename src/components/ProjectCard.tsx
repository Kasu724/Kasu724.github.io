import type { Project } from '../types/project'

type ProjectCardProps = {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
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

      <p className="project-card__links">
        <a href={project.liveUrl}>View project</a>
        <span aria-hidden="true">/</span>
        <a href={project.sourceUrl}>View source</a>
      </p>
    </article>
  )
}

export default ProjectCard