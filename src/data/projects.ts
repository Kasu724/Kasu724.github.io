import type { Project } from '../types/project'

// Project cards are generated from this collection so content stays separate from layout
export const projects: Project[] = [
  {
    title: 'Personalized News Aggregator',
    description: 'A platform that curates news based on user preferences and reading history.',
    highlights: [
      'Built a personalized news aggregation experience with **Next.js** and **TypeScript**.',
      'Stores user preferences and reading history with **Supabase** and **PostgreSQL**.',
      'Uses **Hugging Face** models to tailor recommendations to each reader.',
    ],
    technologies: ['Next.js', 'TypeScript', 'Supabase', 'PosegreSQL', 'Hugging Face'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/news-aggregator',
  },
  {
    title: 'Vitae Stack — AI Resume Tailoring Platform',
    description: 'A platform that helps users tailor their resumes for specific job applications leveraging AI.',
    highlights: [
      'Built an AI-assisted workflow for tailoring resumes to specific job applications.',
      'Uses the **OpenAI API** to generate targeted resume guidance and revisions.',
      'Combines **Next.js**, **TypeScript**, and **SQLite** for the application experience and data layer.',
    ],
    technologies: ['Next.js', 'TypeScript', 'SQLite', 'OpenAI API'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/vitae-stack',
  },
]
