import { Link } from 'react-router-dom';
import { projectPath, projects } from './projects';

const skills = [
  ['Primary languages', 'C++, Python'],
  ['Project languages', 'JavaScript, TypeScript, Kotlin, SQL'],
  ['Frameworks and databases', 'FastAPI, React, SQLAlchemy, PostgreSQL, Android SDK, Tkinter'],
  ['Tools and technologies', 'Git, GitHub, Node.js, Vite, HTML, CSS, Tailwind CSS, Gradle, REST APIs'],
] as const;

const certifications = [
  { title: 'SAP Certified – SAP Generative AI Developer', date: '2026-07', month: 'July 2026' },
  { title: 'SAP Certified – Project Manager – SAP Activate for Agile Implementation Management', date: '2026-07', month: 'July 2026' },
  { title: 'PMI Project Management Ready™', date: '2026-03', month: 'March 2026' },
  { title: 'IT Specialist – Python (Certiport)', date: '2025-07', month: 'July 2025' },
];

export function QualificationsPage() {
  return (
    <main id="main" tabIndex={-1} className="shell portfolio-page">
      <section className="qualifications-section" id="qualifications" aria-labelledby="qualifications-title">
        <div className="qualifications-intro">
          <h1 id="qualifications-title">Qualifications<span>.</span></h1>
          <dl className="qualification-availability">
            <div><dt>Internship availability</dt><dd>December 2026 or January 2027</dd></div>
            <div><dt>OJT requirement</dt><dd>520 hours</dd></div>
          </dl>
        </div>
        <div className="qualification-list">
          <section aria-labelledby="education-title">
            <h2 id="education-title">Education</h2>
            <div className="qualification-entry">
              <h3>FEU Institute of Technology</h3>
              <p>B.S. Computer Science, Specialization in Software Engineering</p>
              <p className="qualification-meta">2023–2027 (expected)</p>
            </div>
          </section>

          <section aria-labelledby="skills-title">
            <h2 id="skills-title">Technical skills</h2>
            <dl className="qualification-skills">
              {skills.map(([name, details]) => <div key={name}><dt>{name}</dt><dd>{details}</dd></div>)}
            </dl>
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

          <section aria-labelledby="cv-projects-title">
            <h2 id="cv-projects-title">Selected projects</h2>
            <ul className="qualification-projects">
              {projects.map((project) => (
                <li key={project.id}><Link to={projectPath(project)}>{project.title}</Link><span>{project.role}</span></li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
