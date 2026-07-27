function SkillsSection() {
  return (
    <section className="content-section" id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title">Skills</h2>

      <div className="skills-grid">
        <section className="skill-group" aria-labelledby="frontend-title">
          <h3 id="frontend-title">Frontend</h3>
          <ul>
            <li>React placeholder</li>
            <li>TypeScript placeholder</li>
            <li>CSS placeholder</li>
          </ul>
        </section>

        <section className="skill-group" aria-labelledby="tools-title">
          <h3 id="tools-title">Tools</h3>
          <ul>
            <li>Git placeholder</li>
            <li>Vite placeholder</li>
          </ul>
        </section>
      </div>
    </section>
  )
}

export default SkillsSection