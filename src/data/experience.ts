export type Experience = {
  company: string
  role: string
  date: string
  highlights: string[]
}

export const experiences: Experience[] = [
  {
    company: 'Panasonic North America',
    role: 'Software Engineering Intern',
    date: 'May 2026 - Present',
    highlights: [
      'Engineered a **Python ETL pipeline** that extracted data from **200+** customs compliance PDFs per month, achieving **99%** field-level accuracy using deterministic classifiers, regex parsers, and AI parsing',
      'Architected **Databricks** ingestion workflows using **Azure Content Understanding** to classify documents, extract structured fields, and validate outputs, reducing end-to-end processing time by **80%**',
      'Implemented **validation**, **exception logging**, and Excel outputs to trace extractions to source documents',
    ],
  },
  {
    company: 'Stevens Student Managed Investment Fund',
    role: 'Head Quantitative Developer',
    date: 'Jan 2026 - Present',
    highlights: [
      'Engineered an asynchronous Python **REST API** using **Redis** job queues to ingest **FRED** and **Bloomberg data**, standardize time-series schemas, and handle rate limits and failures through **retries** and **idempotent jobs**',
      'Reduced complex query latency by **50%** through schema redesign and query optimization across **ClickHouse** and **PostgreSQL**, accelerating model-development workflows for quantitative researchers',
      'Deployed ETL jobs via **Kubernetes CronJobs** for daily refreshes across **500,000+** time-series records'
    ],
  },
  {
    company: 'CommitPro Chrome Extension Research @ Stevens Institute of Technology',
    role: 'Computer Science Researcher',
    date: 'May 2025 - Aug 2025',
    highlights: [
      'Developed and containerized a full-stack Chrome extension using **React**, **Java Spring Boot**, and **Docker** that sent Git diffs, repository structure, and static-analysis metadata to **LLM APIs** for commit summaries',
      'Designed a **RAG** pipeline that indexed repository structure and retrieved relevant files for each code change, improving evaluated commit-summary quality by **30%** over diff-only prompting',
    ],
  },
  {
    company: 'WIT Contests',
    role: 'Software Engineering Intern',
    date: 'Jan 2024 - Jun 2024',
    highlights: [
      'Engineered a real-time online multiplayer sports game in Unity **C#**, supporting up to 16 concurrent players via the Photon Engine SDK, implementing **client-server synchronization** and **latency handling**',
      'Designed **OOP** and state machine architecture for character systems, physics interactions, and animation management, reducing user churn by **20%** through playtesting and gameplay optimization',
    ],
  },
]
