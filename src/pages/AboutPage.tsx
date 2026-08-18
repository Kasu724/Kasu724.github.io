function AboutPage() {
  return (
    <main className="standalone-page">
      <section className="page-intro" aria-labelledby="about-page-title">
        <p className="page-intro__eyebrow">About / beyond the résumé</p>
        <h1 id="about-page-title">I build reliable systems for complicated problems.</h1>
        <p className="page-intro__lede">
          I’m Kevin Lui, a Computer Science student at Stevens Institute of Technology.
          I’m most interested in the places where software engineering, machine learning,
          data, and quantitative reasoning overlap.
        </p>
      </section>

      <section className="about-page-grid" aria-label="More about Kevin">
        <article className="detail-card">
          <span className="detail-card__index">01</span>
          <h2>How I work</h2>
          <p>
            I like turning ambiguous requirements into systems that are understandable,
            testable, and useful. That usually means learning the domain first, choosing
            the simplest durable architecture, and making tradeoffs visible.
          </p>
        </article>

        <article className="detail-card">
          <span className="detail-card__index">02</span>
          <h2>What draws me in</h2>
          <p>
            The best projects give me a hard technical constraint and a clear human
            outcome. I’m especially drawn to data-intensive products, AI systems, and
            developer tools where correctness matters as much as speed.
          </p>
        </article>

        <article className="detail-card">
          <span className="detail-card__index">03</span>
          <h2>What I’m learning</h2>
          <p>
            My studies in computer science, quantitative finance, and mathematics help me
            move between implementation and analysis—and keep asking better questions of
            the systems I build.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AboutPage
