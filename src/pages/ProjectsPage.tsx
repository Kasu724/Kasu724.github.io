import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import { ProjectDialog } from '../components/ProjectsSection'
import type { Project } from '../types/project'

function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogOrigin, setDialogOrigin] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [isClosing, setIsClosing] = useState(false)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!selectedProject) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsClosing(true)
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedProject])

  function openProject(project: Project, origin: HTMLElement) {
    const bounds = origin.getBoundingClientRect()
    const nextOrigin = {
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    }
    previouslyFocusedElement.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    setDialogOrigin(nextOrigin)
    setIsClosing(false)
    setSelectedProject(project)
  }

  function closeProject() {
    if (!selectedProject || isClosing) return

    setIsClosing(true)
  }

  function finishClosing() {
    setSelectedProject(null)
    setIsClosing(false)
    setDialogOrigin({ left: 0, top: 0, width: 0, height: 0 })
    previouslyFocusedElement.current?.focus()
    previouslyFocusedElement.current = null
  }

  return (
    <main className="standalone-page">
      <section className="projects-page" aria-labelledby="projects-page-title">
        <h1 id="projects-page-title" className="page-section-label">Project</h1>

        <div className="projects-grid projects-grid--page">
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              isOpen={selectedProject?.title === project.title}
              isClosing={selectedProject?.title === project.title && isClosing}
              onOpen={(origin) => openProject(project, origin)}
            />
          ))}
        </div>
        {selectedProject && (
          <ProjectDialog
            project={selectedProject}
            origin={dialogOrigin}
            isClosing={isClosing}
            onClose={closeProject}
            onExitComplete={finishClosing}
          />
        )}
      </section>
    </main>
  )
}

export default ProjectsPage
