import type { CSSProperties } from 'react'

type Skill = {
  name: string
  image: string
  iconBackground: string
}

type SkillGroup = {
  id: string
  name: string
  skills: Skill[]
}

const skillGroups: SkillGroup[] = [
  {
    id: 'languages-title',
    name: 'Languages',
    skills: [
      { name: 'Python', image: '/tech-icons/python.svg', iconBackground: '#1f4565' },
      { name: 'C++', image: '/tech-icons/cpp.svg', iconBackground: '#173852' },
      { name: 'C', image: '/tech-icons/c.svg', iconBackground: '#253746' },
      { name: 'JavaScript', image: '/tech-icons/javascript.svg', iconBackground: '#e8ce3d' },
      { name: 'TypeScript', image: '/tech-icons/typescript.svg', iconBackground: '#1f568a' },
      { name: 'Java', image: '/tech-icons/java.svg', iconBackground: '#1e2a3a' },
    ],
  },
  {
    id: 'frontend-title',
    name: 'Frontend',
    skills: [
      { name: 'React', image: '/tech-icons/react.svg', iconBackground: '#1f434c' },
      { name: 'Vite', image: '/tech-icons/vite.svg', iconBackground: '#33275a' },
      { name: 'HTML', image: '/tech-icons/html.svg', iconBackground: '#7c2f1d' },
      { name: 'CSS', image: '/tech-icons/css.svg', iconBackground: '#183b5c' },
    ],
  },
  {
    id: 'ml-ai-title',
    name: 'ML / AI',
    skills: [
      { name: 'TensorFlow', image: '/tech-icons/tensorflow.svg', iconBackground: '#703b18' },
      { name: 'scikit-learn', image: '/tech-icons/scikit-learn.svg', iconBackground: '#4b2f16' },
      { name: 'Hugging Face', image: '/tech-icons/hugging-face.svg', iconBackground: '#6a5a16' },
      { name: 'OpenCV', image: '/tech-icons/opencv.svg', iconBackground: '#143e39' },
      { name: 'RAG', image: '/tech-icons/rag.svg', iconBackground: '#e7e8e5' },
    ],
  },
  {
    id: 'data-title',
    name: 'Data & Databases',
    skills: [
      { name: 'NumPy', image: '/tech-icons/numpy.svg', iconBackground: '#1e4772' },
      { name: 'Pandas', image: '/tech-icons/pandas.svg', iconBackground: '#ddd9ef' },
      { name: 'PostgreSQL', image: '/tech-icons/postgresql.svg', iconBackground: '#1d3749' },
      { name: 'SQLite', image: '/tech-icons/sqlite.svg', iconBackground: '#174e78' },
      { name: 'Supabase', image: '/tech-icons/supabase.svg', iconBackground: '#164c3f' },
      { name: 'ClickHouse', image: '/tech-icons/clickhouse.svg', iconBackground: '#6b5725' },
    ],
  },
  {
    id: 'cloud-devops-title',
    name: 'Cloud & DevOps',
    skills: [
      { name: 'Docker', image: '/tech-icons/docker.svg', iconBackground: '#164563' },
      { name: 'Kubernetes', image: '/tech-icons/kubernetes.svg', iconBackground: '#243d7a' },
      { name: 'Databricks', image: '/tech-icons/databricks.svg', iconBackground: '#f0dedd' },
    ],
  },
  {
    id: 'developer-tools-title',
    name: 'Developer Tools',
    skills: [
      { name: 'Git', image: '/tech-icons/git.svg', iconBackground: '#5a2c20' },
      { name: 'GitHub', image: '/tech-icons/github.svg', iconBackground: '#e7e8eb' },
      { name: 'Linux (Ubuntu)', image: '/tech-icons/ubuntu.svg', iconBackground: '#3b2024' },
    ],
  },
]

function SkillsSection() {
  return (
    <section className="content-section" id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title">Skills</h2>

      <div className="skills-groups">
        {skillGroups.map((group) => (
          <section className="skill-group" key={group.id} aria-labelledby={group.id}>
            <h3 id={group.id}>{group.name}</h3>
            <ul className="skills-grid">
              {group.skills.map((skill) => (
                <li className="skill-card" key={skill.name}>
                  <span
                    className="skill-card__icon-frame"
                    style={{ '--skill-icon-bg': skill.iconBackground } as CSSProperties}
                  >
                    <img
                      className="skill-card__icon"
                      src={skill.image}
                      alt=""
                    />
                  </span>
                  <span className="skill-card__name">{skill.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}

export default SkillsSection
