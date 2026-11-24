import { Github, Mail, Mountain, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import boopLogo from './assets/boop/logo.png';
import pastelGameplay from './assets/boop/pastel-gameplay.png';
import sunflowerGameplay from './assets/boop/sunflower-gameplay.png';
import { checkpoints } from './checkpoints';
import { MountainScene } from './MountainScene';
import { QualificationsPage } from './QualificationsPage';
import { projectPath, projects, type ProjectCategory } from './projects';

const categories: ('All' | ProjectCategory)[] = ['All', 'Systems', 'Games', 'Tools'];
const github = 'https://github.com/wander-code';
const email = 'mailto:wanderer.migs@gmail.com';
const legacySections: Record<string, string> = {
  '#work': '/projects',
  '#about': '/qualifications',
  '#qualifications': '/qualifications',
  '#contact': '/contact',
};
const pageTitles: Record<string, string> = {
  '/projects': 'Projects',
  '/qualifications': 'Qualifications',
  '/contact': 'Contact',
};

function ProjectArt({ id }: { id: string }) {
  return (
    <div className={`project-art art-${id}`} aria-hidden="true">
      {id === 'dotexe' && <div className="art-stack"><i /><i /><i /><i /><i /></div>}
      {id === 'boop' && <div className="boop-logo"><img src={boopLogo} width={720} height={1650} alt="" /></div>}
      {id === 'schedule-optimizer' && <div className="art-calendar"><i /><i /><i /><i /><i /></div>}
      {id === 'starrunesonders' && <div className="art-language"><span>{'{ '}</span><i>✦</i><span>{' }'}</span></div>}
    </div>
  );
}

function Home({ light }: { light: boolean }) {
  const { hash } = useLocation();
  const [selected, setSelected] = useState(0);
  const textOverlay = useRef<HTMLDivElement>(null);
  const route = legacySections[hash];
  if (route) return <Navigate to={route} replace />;
  const checkpoint = checkpoints[selected];

  return (
    <main id="main" tabIndex={-1} className="home-page">
      <section className="trail-hero" aria-labelledby="hero-title">
        <div className="trail-sidebar">
          <nav className="trail-nav" aria-label="Main navigation">
            <Link to="/" aria-current="page">Home</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/qualifications">Qualifications</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <div ref={textOverlay} className="trail-copy">
            <div className="trail-identity">
              <p className="trail-name">Tomas Capili</p>
              <h1 id="hero-title">Wander<span>.</span></h1>
              <p className="trail-intro">Software engineering student, an endurance mountaineer in the Philippines.</p>
            </div>
            <section className="checkpoint-summary" aria-label="Selected checkpoint" aria-live="polite">
              <p className="checkpoint-stage">{checkpoint.stage}</p>
              <h2>{checkpoint.title}</h2>
              <p className="checkpoint-detail">{checkpoint.detail}</p>
            </section>
          </div>
        </div>
        <MountainScene light={light} selected={selected} onSelect={setSelected} textOverlay={textOverlay} />
      </section>
    </main>
  );
}

function ProjectsPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const filtered = category === 'All' ? projects : projects.filter((project) => project.category === category);

  return (
    <main id="main" tabIndex={-1} className="shell portfolio-page">
      <section className="work-section" id="work" tabIndex={-1} aria-labelledby="work-title">
        <div className="section-heading">
          <h1 id="work-title">Projects<span>.</span></h1>
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
                  <h2>{project.title}</h2>
                  <p>{project.summary}</p>
                  <span className="project-cta">View case study</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="shell portfolio-page">
      <section className="contact-section" id="contact" tabIndex={-1} aria-labelledby="contact-title">
        <div>
          <h1 id="contact-title">Contact<span>.</span></h1>
          <p>Get in touch about software engineering, a project, or a good trail.</p>
        </div>
        <div className="trail-contact-links">
          <a className="primary-button" href={email}><Mail size={18} /> Email me</a>
          <a className="secondary-button" href={github}><Github size={18} /> GitHub</a>
        </div>
      </section>
    </main>
  );
}

function BoopGallery() {
  return (
    <section className="boop-gallery" aria-labelledby="boop-gallery-title">
      <h2 id="boop-gallery-title">Gameplay screenshots</h2>
      <div className="boop-gallery-grid">
        <figure>
          <div className="boop-screenshot"><img src={pastelGameplay} width={720} height={1650} alt="Numbered pastel targets with a score of 665 and two hearts left" loading="lazy" /></div>
          <figcaption>Pastel targets</figcaption>
        </figure>
        <figure>
          <div className="boop-screenshot"><img src={sunflowerGameplay} width={720} height={1650} alt="Numbered sunflowers above grass with a blue sky and three hearts" loading="lazy" /></div>
          <figcaption>Sunflower targets</figcaption>
        </figure>
      </div>
    </section>
  );
}

function CaseStudy() {
  const { id } = useParams();
  const project = projects.find((entry) => entry.id === id);
  if (!project) return <NotFound />;

  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <main id="main" tabIndex={-1} className="shell case-page" style={{ '--project-color': project.color } as CSSProperties}>
      <Link className="back-link" to="/projects">All projects</Link>
      <section className="case-hero" aria-labelledby="case-title">
        <div>
          <p className="eyebrow">{project.discipline}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="intro">{project.summary}</p>
          <ul className="tags" aria-label="Project topics">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
        </div>
        <ProjectArt id={project.id} />
      </section>
      {project.id === 'boop' && <BoopGallery />}
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
      <Link className="next-project" to={projectPath(next)}><span className="eyebrow">Next project</span><strong>{next.title}</strong></Link>
    </main>
  );
}

function NotFound() {
  return <main id="main" tabIndex={-1} className="shell case-page"><h1>Page missing.</h1><Link className="back-link" to="/">Back to the portfolio</Link></main>;
}

function usePageNavigation() {
  const { pathname } = useLocation();

  useEffect(() => {
    const project = projects.find((entry) => projectPath(entry) === pathname);
    const title = project?.title ?? pageTitles[pathname] ?? 'Wander';
    document.title = title + ' — Tomas Capili';
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);
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
  const onHome = pathname === '/';
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
    <div className={onHome ? 'home-frame' : undefined}>
      <button type="button" className="skip-link" onClick={() => document.getElementById('main')?.focus()}>Skip to content</button>
      <header className={onHome ? 'site-header site-header-home' : 'site-header'}>
        <div className="shell header-content">
          <Link className="brand" to="/" aria-label="Wander Code home"><Mountain size={22} /> <span>WANDER<span className="brand-divider">/</span>CODE</span></Link>
          {!onHome && (
            <nav aria-label="Main navigation">
              <Link to="/projects" aria-current={pathname.startsWith('/projects') ? 'true' : undefined}>Projects</Link>
              <Link to="/qualifications">Qualifications</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          )}
          <button type="button" className="theme-button" aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'} onClick={() => setLight(!light)}>{light ? <Moon size={18} /> : <Sun size={19} />}</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home light={light} />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/qualifications" element={<QualificationsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects/:id" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!onHome && (
        <footer className="site-footer">
          <div className="shell footer-content">
            <span>Tomas Capili</span>
            <a href={github}><Github size={16} /> GitHub</a>
            <Link to="/">Back to Wander</Link>
          </div>
        </footer>
      )}
    </div>
  );
}
