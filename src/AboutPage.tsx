import { Link } from 'react-router-dom';
import { projectPath, projects } from './projects';
import './about.css';

const certifications = [
  { title: 'SAP Certified – SAP Generative AI Developer', date: '2026-07', month: 'July 2026' },
  { title: 'SAP Certified – Project Manager – SAP Activate for Agile Implementation Management', date: '2026-07', month: 'July 2026' },
  { title: 'PMI Project Management Ready™', date: '2026-03', month: 'March 2026' },
  { title: 'IT Specialist – Python (Certiport)', date: '2025-07', month: 'July 2025' },
];

export function AboutPage({ name }: { name: string }) {
  return (
    <main id="main" tabIndex={-1} className="shell portfolio-page about-page">
      <header className="about-header">
        <h1>{name}<span>.</span></h1>
      </header>

      <dl className="about-details">
        <div>
          <dt>Who</dt>
          <dd>I’m a software engineer who likes turning ideas into tools people can use. I build early because a prototype gives me something real to learn from.</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>Cainta, Rizal, Philippines</dd>
        </div>
        <div>
          <dt>How</dt>
          <dd>I like to wander through a problem until I can picture it in 3D. It feels like exploring an RPG map. I want to see what each part does, how it connects to the rest, and what’s happening down to the ones and zeroes.</dd>
        </div>
        <div>
          <dt>How deep?</dt>
          <dd>Talent helps me see possibilities. Hard work gets me through the details. Curiosity makes me ask why something works, so I can explain my decisions and own the result.</dd>
        </div>
        <div>
          <dt>How I get things done</dt>
          <dd>I sketch the architecture, trace how data moves, and build a working path from end to end, one block at a time. Once it runs, I test the rough spots and polish what people will actually use.</dd>
        </div>
        <div>
          <dt>Skills</dt>
          <dd>C++ and Python are my strongest languages. I also work with JavaScript, TypeScript, Kotlin, and SQL. My projects use FastAPI, React, PostgreSQL, Android SDK, and Git.</dd>
        </div>
      </dl>

      <div className="qualification-list">
        <section aria-labelledby="education-title">
          <h2 id="education-title">Education</h2>
          <div className="qualification-entry">
            <h3>FEU Institute of Technology</h3>
            <p>B.S. Computer Science, Specialization in Software Engineering</p>
            <p className="qualification-meta">2023–2027 (expected)</p>
          </div>
        </section>

        <section aria-labelledby="internship-title">
          <h2 id="internship-title">Internship</h2>
          <p>Available December 2026 or January 2027 for a 520-hour OJT placement.</p>
        </section>

        <section aria-labelledby="certifications-title">
          <h2 id="certifications-title">Certifications</h2>
          <ul className="qualification-certifications">
            {certifications.map(({ title, date, month }) => (
              <li key={title}><span>{title}</span><time dateTime={date}>{month}</time></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="leadership-title">
          <h2 id="leadership-title">Leadership and activities</h2>
          <div className="qualification-entry">
            <h3>FEU Tech Association of Student Technopreneurs and Innovators (ASTI)</h3>
            <p>Technicals / Technical Head</p>
            <p className="qualification-meta">Membership from August 2024 to August 2025</p>
          </div>
          <div className="qualification-entry">
            <h3>ARTwakening Festival</h3>
            <p>As Technical Head, I oversaw laptop-based technical operations and coordinated event flow.</p>
            <p className="qualification-meta">Term 3 of AY 2023–2024 and Terms 1 and 3 of AY 2024–2025</p>
          </div>
        </section>

        <section className="qualification-project-section" aria-labelledby="cv-projects-title">
          <h2 id="cv-projects-title">Selected projects</h2>
          <ul className="qualification-projects">
            {projects.map((project) => (
              <li key={project.id}><Link target="_blank" rel="noopener" to={projectPath(project)}>{project.title}</Link><span>{project.role}</span></li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
