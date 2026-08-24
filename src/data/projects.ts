import type { Project } from '../types/project'

// Project cards are generated from this collection so content stays separate from layout
export const projects: Project[] = [
  {
    title: 'Personalized News Aggregator',
    description: 'A platform that curates news based on user preferences and reading history.',
    highlights: [
      'Built a **Next.js**, **Supabase**, and **PostgreSQL** news platform supporting **500+** users, processing **1,000+** articles per day through **REST API** automated ingestion, classification, and personalized ranking pipelines',
      'Integrated a **Hugging Face** transformer for headline classification, reaching **90%** accuracy on held-out data',
    ],
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'PosegreSQL', 'Hugging Face'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/news-aggregator',
  },
  {
    title: 'Vitae Stack — AI Resume Tailoring Platform',
    description: 'A platform that helps users tailor their resumes for specific job applications leveraging AI.',
    highlights: [
      'Built an open-source resume-tailoring platform with **Next.js**, **TypeScript**, and **SQLite** that processes documents locally, scores resumes against job descriptions, and exports tailored PDF/DOCX files',
      'Designed a provenance-aware **LLM** pipeline that links every generated claim to user-provided evidence, maintains versioned document history, and isolates sensitive data locally',
    ],
    technologies: ['Next.js', 'TypeScript', 'SQLite', 'OpenAI API'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/vitae-stack',
  },
]

export const featuredProjects = projects.slice(0, 2)
