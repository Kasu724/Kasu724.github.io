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
            <p className="education-entry__major">
              Bachelor of Science in <span className="education-entry__field-name">Computer Science</span>
            </p>
            <p className="education-entry__minors">
              Minors in <span className="education-entry__field-name">Quantitative Finance</span> ·{' '}
              <span className="education-entry__field-name">Pure and Applied Mathematics</span>
            </p>
          </div>
          <div className="education-entry__meta" aria-label="Attendance details">
            <p>Sep 2024 — Expected May 2028</p>
            <p className="education-entry__location">Hoboken, NJ</p>
          </div>
        </div>

        <dl className="education-entry__details">
          <div>
            <dt>GPA</dt>
            <dd>4.00 / 4.00</dd>
          </div>
          <div>
            <dt className="education-entry__subheading">Relevant Coursework</dt>
            <dd>Data Structures · Algorithms · Enterprise Software Architecture & Design · Computer Architecture · Machine Learning · Principles of Programming Languages · Linear Algebra · Statistics</dd>
          </div>
          <div>
            <dt className="education-entry__subheading">Honors &amp; Scholarships</dt>
              <dd>
              <ul className="education-entry__list">
                <li>The Lawrence T. Babbio '66 Pinnacle Scholars Program</li>
                <li>Dean's List</li>
                <li>Edwin A. Stevens Scholarship</li>
                <li>Stevens Presidential Scholarship</li>
              </ul>
            </dd>
            </div>
        </dl>
      </article>
    </section>
  )
}

export default EducationSection
