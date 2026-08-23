import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import { ProjectDialog } from '../components/ProjectsSection'
import type { Project } from '../types/project'

function ProjectsPage() {
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
            <ProjectCard key={project.title} project={project} onOpen={() => openProject(project)} />
          ))}
        </div>
        {selectedProject && <ProjectDialog project={selectedProject} onClose={closeProject} />}
      </section>
    </main>
  )
}

export default ProjectsPage
