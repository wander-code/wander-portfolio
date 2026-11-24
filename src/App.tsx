import { Github, Mail, Mountain, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { BoopDemo } from './BoopDemo';
import { MountainScene } from './MountainScene';
import { ProjectMap } from './ProjectMap';
import { projectPath, projects, type ProjectCategory } from './projects';

const categories: ('All' | ProjectCategory)[] = ['All', 'Systems', 'Games', 'Tools'];
const github = 'https://github.com/wander-code';
const email = 'mailto:wanderer.migs@gmail.com';

function ProjectArt({ id }: { id: string }) {
  return (
    <div className={`project-art art-${id}`} aria-hidden="true">
      {id === 'dotexe' && <div className="art-stack"><i /><i /><i /><i /><i /></div>}
      {id === 'boop' && <div className="art-bubbles"><i /><i /><i /><i /><i /></div>}
      {id === 'schedule-optimizer' && <div className="art-calendar"><i /><i /><i /><i /><i /></div>}
      {id === 'starrunesonders' && <div className="art-language"><span>{'{ '}</span><i>✦</i><span>{' }'}</span></div>}
    </div>
  );
}

function Home({ light }: { light: boolean }) {
  const trail = useRef<HTMLElement>(null);
  const { hash } = useLocation();
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const filtered = category === 'All' ? projects : projects.filter((project) => project.category === category);

  return (
    <main id="main" tabIndex={-1}>
      <section ref={trail} className="trail-hero" aria-labelledby="hero-title">
        <nav className="trail-nav" aria-label="Main navigation">
          <Link to="/#work" aria-current={hash === '#work' ? 'location' : undefined}>Projects</Link>
          <Link to="/#qualifications" aria-current={hash === '#qualifications' ? 'location' : undefined}>Qualifications</Link>
          <Link to="/#contact" aria-current={hash === '#contact' ? 'location' : undefined}>Contact</Link>
        </nav>
        <div className="trail-identity">
          <p className="trail-name">Tomas Capili</p>
          <h1 id="hero-title">Wander<span>.</span></h1>
          <p className="trail-intro">Software engineering student and hiker in the Philippines.</p>
        </div>
        <MountainScene light={light} hero={trail} />
      </section>

      <div className="shell">
        <section className="work-section" id="work" tabIndex={-1} aria-labelledby="work-title">
          <div className="section-heading">
            <h2 id="work-title">Projects<span>.</span></h2>
            <div className="filter-list" role="group" aria-label="Filter projects">
              {categories.map((option) => (
                <button key={option} type="button" aria-pressed={category === option} onClick={() => setCategory(option)}>{option}</button>
              ))}
            </div>
          </div>
          <p className="visually-hidden" role="status">{filtered.length} projects shown</p>
          <div className="project-grid">
            {filtered.map((project) => (
              <article key={project.id} className="project-card" style={{ '--project-color': project.color } as CSSProperties}>
                <Link to={projectPath(project)} className="project-card-link" aria-label={project.title + ' case study'}>
                  <ProjectArt id={project.id} />
                  <div className="project-card-text">
                    <p className="eyebrow">{project.discipline}</p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <span className="project-cta">View case study</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          <details className="project-map-disclosure">
            <summary>Explore the project map</summary>
            <ProjectMap light={light} />
          </details>
        </section>

        <section className="qualifications-section" id="qualifications" tabIndex={-1} aria-labelledby="qualifications-title">
          <h2 id="qualifications-title">Qualifications<span>.</span></h2>
          <div className="qualification-list">
            <article>
              <h3>Education</h3>
              <p>Software engineering student at FEU Institute of Technology.</p>
            </article>
            <article>
              <h3>Technical skills</h3>
              <p>C++ and Python are my strongest languages. My projects cover backend engineering, optimization, Android development, and language design.</p>
            </article>
            <article>
              <h3>Leadership</h3>
              <p>I led the four-person DotEXE thesis team and handled technical operations for ARTwakening across three academic terms.</p>
            </article>
          </div>
        </section>

        <section className="contact-section" id="contact" tabIndex={-1} aria-labelledby="contact-title">
          <div>
            <h2 id="contact-title">Contact<span>.</span></h2>
            <p>Get in touch about software engineering, a project, or a good trail.</p>
          </div>
          <div className="trail-contact-links">
            <a className="primary-button" href={email}><Mail size={18} /> Email me</a>
            <a className="secondary-button" href={github}><Github size={18} /> GitHub</a>
          </div>
        </section>
      </div>
    </main>
  );
}

function CaseStudy() {
  const { id } = useParams();
  const project = projects.find((entry) => entry.id === id);
  if (!project) return <NotFound />;

  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <main id="main" tabIndex={-1} className="shell case-page" style={{ '--project-color': project.color } as CSSProperties}>
      <Link className="back-link" to="/#work">All projects</Link>
      <section className="case-hero" aria-labelledby="case-title">
        <div>
          <p className="eyebrow">{project.discipline}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="intro">{project.summary}</p>
          <ul className="tags" aria-label="Project topics">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
        </div>
        <ProjectArt id={project.id} />
      </section>
      <div className="case-body">
        <section><h2>What I built</h2><p>{project.approach}</p></section>
        <section>
          <h2>My contribution</h2>
          <p className="case-role">{project.role}</p>
          <p>{project.contribution}</p>
        </section>
        <section>
          <h2>Project status</h2>
          <p>{project.status}</p>
          {project.repository && <a className="secondary-button" href={project.repository}><Github size={17} /> View source on GitHub</a>}
        </section>
      </div>
      {project.id === 'boop' && <BoopDemo />}
      <Link className="next-project" to={projectPath(next)}><span className="eyebrow">Next project</span><strong>{next.title}</strong></Link>
    </main>
  );
}

function NotFound() {
  return <main id="main" tabIndex={-1} className="shell case-page"><h1>Page missing.</h1><Link className="back-link" to="/">Back to the portfolio</Link></main>;
}

function usePageNavigation() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const project = projects.find((entry) => projectPath(entry) === pathname);
    document.title = project ? `${project.title} — Tomas Capili` : 'Wander — Tomas Capili';

    const anchor = hash === '#about' ? 'qualifications' : hash.slice(1);
    const target = document.getElementById(anchor || 'main');
    if (hash && target) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    target?.focus({ preventScroll: true });
  }, [pathname, hash]);
}

function initialTheme() {
  try {
    return localStorage.getItem('portfolio-theme') === 'light';
  } catch {
    return false;
  }
}

export function App() {
  const [light, setLight] = useState(initialTheme);
  const { pathname } = useLocation();
  usePageNavigation();

  useEffect(() => {
    const theme = light ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f1f2e8' : '#121711');
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // The toggle still works when storage is unavailable.
    }
  }, [light]);

  return (
    <>
      <button type="button" className="skip-link" onClick={() => document.getElementById('main')?.focus()}>Skip to content</button>
      <header className={pathname === '/' ? 'site-header site-header-home' : 'site-header'}>
        <div className="shell header-content">
          <Link className="brand" to="/" aria-label="Wander Code home"><Mountain size={22} /> <span>WANDER<span className="brand-divider">/</span>CODE</span></Link>
          {pathname !== '/' && (
            <nav aria-label="Main navigation">
              <Link to="/#work" aria-current={pathname.startsWith('/projects/') ? 'true' : undefined}>Projects</Link>
              <Link to="/#qualifications">Qualifications</Link>
              <Link to="/#contact">Contact</Link>
            </nav>
          )}
          <button type="button" className="theme-button" aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'} onClick={() => setLight(!light)}>{light ? <Moon size={18} /> : <Sun size={19} />}</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home light={light} />} />
        <Route path="/projects/:id" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="site-footer">
        <div className="shell footer-content">
          <span>Tomas Capili</span>
          <a href={github}><Github size={16} /> GitHub</a>
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>Back to top</Link>
        </div>
      </footer>
    </>
  );
}
