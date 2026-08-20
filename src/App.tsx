import AboutSection from './components/AboutSection'
import ExtraInfoSection from './components/ExtraInfoSection'
import EducationSection from './components/EducationSection'
import ExperienceSection from './components/ExperienceSection'
import ProjectsSection from './components/ProjectsSection'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import SkillsSection from './components/SkillsSection'
import { ServiceStatusProvider } from './components/ServiceStatusContext'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'

export type Page = 'home' | 'about' | 'projects'

function getCurrentPage(): Page {
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase()

  if (path.endsWith('/about')) return 'about'
  if (path.endsWith('/projects')) return 'projects'

  return 'home'
}

function HomePage() {
  return (
    <main>
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <ExtraInfoSection />
    </main>
  )
}

function App() {
  const currentPage = getCurrentPage()

  return (
    <ServiceStatusProvider>
      <div id="top">
        <SiteHeader currentPage={currentPage} />
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'projects' && <ProjectsPage />}
        <SiteFooter />
      </div>
    </ServiceStatusProvider>
  )
}

export default App
