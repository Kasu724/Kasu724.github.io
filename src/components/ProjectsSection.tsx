import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'

function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-title">
      <h2 id="projects-title">Projects</h2>

      {projects.map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </section>
  )
}

export default ProjectsSection