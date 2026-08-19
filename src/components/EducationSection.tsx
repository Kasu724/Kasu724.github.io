function EducationSection() {
  return (
    <section
      className="content-section education-section"
      id="education"
      aria-labelledby="education-title"
    >
      <h2 id="education-title">Education</h2>

      <article className="education-entry">
        <div className="education-entry__heading">
          <div>
            <h3>Stevens Institute of Technology</h3>
            <p>Bachelor of Science in Computer Science</p>
            <p className="education-entry__status">In progress</p>
          </div>
          <p className="education-entry__date">Dates attended: —</p>
        </div>

        <dl className="education-entry__summary">
          <div>
            <dt>Location</dt>
            <dd>Hoboken, NJ</dd>
          </div>
          <div>
            <dt>Honors</dt>
            <dd>—</dd>
          </div>
          <div>
            <dt>GPA</dt>
            <dd>—</dd>
          </div>
          <div>
            <dt>Scholarships</dt>
            <dd>—</dd>
          </div>
        </dl>

        <dl className="education-entry__details">
          <div>
            <dt>Minors</dt>
            <dd>Quantitative Finance · Pure and Applied Mathematics</dd>
          </div>
          <div>
            <dt>Relevant Coursework</dt>
            <dd>Data Structures · Algorithms · Enterprise Software Architecture & Design · Computer Architecture · Machine Learning · Principles of Programming Languages · Linear Algebra ·  Statistics</dd>
          </div>
        </dl>
      </article>
    </section>
  )
}

export default EducationSection
