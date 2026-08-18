import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

function ProjectsPage() {
  return (
    <main className="standalone-page">
      <section className="page-intro" aria-labelledby="projects-page-title">
        <p className="page-intro__eyebrow">Projects / selected work</p>
        <h1 id="projects-page-title">Things I’ve designed, built, and shipped.</h1>
        <p className="page-intro__lede">
          A collection of software, AI, data, and quantitative projects. Each one started
          with a problem worth understanding before it became a technical solution.
        </p>
      </section>

      <section aria-label="Project collection">
        <div className="projects-grid projects-grid--page">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default ProjectsPage
