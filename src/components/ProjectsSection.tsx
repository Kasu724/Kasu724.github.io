import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'

function ProjectsSection() {
  return (
    <section
      className="content-section projects-section"
      id="projects"
      aria-labelledby="projects-title"
    >
      <h2 id="projects-title">Projects</h2>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}

export default ProjectsSection