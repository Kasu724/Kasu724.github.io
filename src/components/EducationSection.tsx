function EducationSection() {
  return (
    <section
      className="content-section education-section"
      id="education"
      aria-labelledby="education-title"
    >
      <h2 id="education-title">Education</h2>

      <article className="education-card">
        <div className="education-card__heading">
          <div>
            <h3>Stevens Institute of Technology</h3>
            <p>Bachelor of Science in Computer Science</p>
          </div>
          <span className="education-card__status">In progress</span>
        </div>

        <dl className="education-card__details">
          <div>
            <dt>Minors</dt>
            <dd>Quantitative Finance · Mathematics</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Software systems · Artificial intelligence · Quantitative tools</dd>
          </div>
        </dl>
      </article>
    </section>
  )
}

export default EducationSection
