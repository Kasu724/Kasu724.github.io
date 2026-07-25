import type { Project } from '../types/project'

type ProjectCardProps = {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article>
      <h3>{project.title}</h3>
      <p>{project.description}</p>

      <h4>Technologies</h4>
      <ul>
        {project.technologies.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>

      <p>
        <a href={project.liveUrl}>View project</a>
        {' · '}
        <a href={project.sourceUrl}>View source</a>
      </p>
    </article>
  )
}

export default ProjectCard