import type { Project } from '../types/project'

// Project cards are generated from this collection so content stays separate from layout
export const projects: Project[] = [
  {
    title: 'Personalized News Aggregator',
    description: 'A platform that curates news based on user preferences and reading history',
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
    description: 'A platform that helps users tailor their resumes for specific job applications leveraging AI',
    highlights: [
      'Built an open-source resume-tailoring platform with **Next.js**, **TypeScript**, and **SQLite** that processes documents locally, scores resumes against job descriptions, and exports tailored PDF/DOCX files',
      'Designed a provenance-aware **LLM** pipeline that links every generated claim to user-provided evidence, maintains versioned document history, and isolates sensitive data locally',
    ],
    technologies: ['Next.js', 'TypeScript', 'SQLite', 'OpenAI API'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/vitae-stack',
  },
  {
    title: 'Internship Tracker',
    description: 'An open-source internship tracking platform for SWE and quant roles from top companies',
    highlights: [
      'Engineered a full-stack **Next.js** platform with **PostgreSQL**, **Prisma**, and **REST APIs** to ingest internships from job boards and custom APIs, implementing **ETL**, **normalization**, and **deduplication** pipelines',
      'Built **asynchronous workers** and scheduled **data-ingestion jobs** for polling and source traceability, with **NextAuth**, saved searches, application tracking, and **email/Discord alerts**'
    ],
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'REST APIs', 'Docker'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/faang-quant-tracker',
  },
  {
    title: 'ImageLab Chrome Extension',
    description: 'An open-source Chrome extension for various image downloading and manipulation tools',
    highlights: [
      'Built an open-source **Manifest V3 Chromium** extension with **TypeScript**, **React**, and **Chrome APIs** for image conversion, cropping, compression, clipboard export, and reverse search',
      'Developed a browser-native **Canvas/OffscreenCanvas** processing pipeline with format detection, auto-cropping, resizing, and target-size compression using binary-search quality tuning'
    
    ],
    technologies: ['TypeScript', 'React', 'Chrome Extension APIs/Manifest V3', 'Canvas/OffscreenCanvas', 'FastAPI', 'SQLAlchemy'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/imagelab-extension',
  },
  {
    title: 'Dotfiles (Xubuntu)',
    description: 'My dotfiles for my Xubuntu rice, using bspwm, Polybar, Rofi, and other tools',
    highlights: [
      'Automated a reproducible **Linux rice** with **Bash**, handling **dependency installation**, symlink-based configuration management, file backups, architecture-aware setup, and post-install validation',
      'Built a **Python** configuration-generation pipeline using **OKLab** color interpolation and automated file generation to synchronize **Polybar** and **Rofi** themes'
    ],
    technologies: ['Linux/Xubuntu', 'Bash', 'Python', 'bspwm', 'Polybar', 'Rofi'],
    liveUrl: '',
    sourceUrl: 'https://github.com/Kasu724/dotfiles',
  },
  {
    title: 'Sign Language Translator',
    description: 'A tool that translates sign language into text and speech and vice versa, using CV and ML',
    highlights: [
      'Developed a real-time **MediaPipe** and **OpenCV** hand-tracking pipeline with a **95%** detection rate',
      'Trained a **TensorFlow** gesture classifier for real-time recognition, achieving **80%** held-out test accuracy',
    ],
    technologies: ['Python', 'C#','TensorFlow', 'MediaPipe', 'OpenCV'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: 'Godot 2D Character Controller',
    description: 'An open-source 2D character controller for Godot, built with GDScript and designed for platformer games',
    highlights: [
      'Developed an **OOP**-based 2D character-controller in **GDScript** with configurable movement, collision handling, animation, and physics behavior',
      'Architected movement using a **modular finite-state machine**, separating grounded, airborne, dash, wall-slide, and wall-jump logic'
    ],
    technologies: ['Godot 4', 'GDScript', 'Finite-State Machines', 'Object-Oriented Programming'],
    liveUrl: 'https://kasu724.itch.io/godot-2d-character-controller',
    sourceUrl: 'https://github.com/Kasu724/Godot2DCharacterController',
  },
  {
    title: '\"A Platformer...?\" Game Jam',
    description: 'My submission for the Brackeys Game Jam 2025.1, a short 2D platformer game built in Godot',
    highlights: [
      'Engineered and shipped a modular **Godot** game with **OOP** and reusable systems for player movement, dialogue, checkpoints, scene transitions, and physics objects',
      'Implemented collision-aware object interactions using **RayCast2D**, **ShapeCast2D**, and **runtime scene instantiation**, managing dynamic **physics states** and **object lifecycles**'
    ],
    technologies: ['Godot 4', 'GDScript', 'Finite-State Machines', 'Object-Oriented Programming', 'Dialogic'],
    liveUrl: 'https://kasu724.itch.io/godot-2d-character-controller',
    sourceUrl: 'https://github.com/Kasu724/A-Platformer-Game-Jam',
  },
]

export const featuredProjects = projects.slice(0, 2)
