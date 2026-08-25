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
  {
    title: 'Sign Language Translator',
    description: 'A tool that translates sign language into text and speech and vice versa, using CV and ML.',
    highlights: [
      'Developed a real-time **MediaPipe** and **OpenCV** hand-tracking pipeline with a **95%** detection rate',
      'Trained a **TensorFlow** gesture classifier for real-time recognition, achieving **80%** held-out test accuracy',
    ],
    technologies: ['Python', 'C#','TensorFlow', 'MediaPipe', 'OpenCV'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: 'Internship Tracker',
    description: 'An open-source internship tracking platform for SWE and quant roles from top companies.',
    highlights: [
      'Engineered a full-stack **Next.js** platform with **PostgreSQL**, **Prisma**, and **REST APIs** to ingest internships from job boards and custom APIs, implementing **ETL**, **normalization**, and **deduplication** pipelines',
      'Built **asynchronous workers** and scheduled **data-ingestion jobs** for polling and source traceability, with **NextAuth**, saved searches, application tracking, and **email/Discord alerts**'
    ],
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'REST APIs', 'Docker'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/faang-quant-tracker',
  },
]

export const featuredProjects = projects.slice(0, 2)
