import { Compass, Layers3, LocateFixed } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { projectPath, projects } from './projects';
import { drawTerrain } from './terrain';

export function ProjectMap({ light }: { light: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const coordinates = useRef<HTMLSpanElement>(null);
  const [selected, setSelected] = useState(projects[0]);
  const [showContours, setShowContours] = useState(true);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;

    const redraw = () => drawTerrain(element, light);
    const observer = new ResizeObserver(redraw);
    observer.observe(element);
    return () => observer.disconnect();
  }, [light]);

  function tracePointer(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`);
    if (coordinates.current) coordinates.current.textContent = `X ${x.toFixed(2)} / Y ${y.toFixed(2)}`;
  }

  return (
    <section className="project-map" aria-label="Interactive project map" onPointerMove={tracePointer}>
      <canvas ref={canvas} className={showContours ? 'terrain' : 'terrain terrain-hidden'} aria-hidden="true" />
      <div className="map-light" aria-hidden="true" />
      <div className="map-heading">
        <span><Compass size={16} /> PROJECT MAP</span>
        <span className="map-coordinate" ref={coordinates} aria-hidden="true">X {selected.marker[0].toFixed(2)} / Y {selected.marker[1].toFixed(2)}</span>
      </div>
      <div className="map-compass" aria-hidden="true"><span>N</span><i /><span>S</span></div>
      {projects.map((project) => (
        <button
          type="button"
          key={project.id}
          className="map-marker"
          style={{ left: `${project.marker[0] * 100}%`, top: `${project.marker[1] * 100}%`, '--project-color': project.color } as CSSProperties}
          aria-pressed={selected.id === project.id}
          onClick={() => setSelected(project)}
        >
          <span className="marker-pin" aria-hidden="true" />
          <span className="marker-name">{project.id === 'schedule-optimizer' ? 'Scheduler' : project.title}</span>
        </button>
      ))}
      <div className="map-bottom">
        <div className="map-selection" aria-live="polite">
          <span className="map-selection-type">{selected.discipline}</span>
          <Link to={projectPath(selected)}>{selected.title}<span className="visually-hidden"> case study</span></Link>
        </div>
        <div className="map-controls">
          <button type="button" aria-label="Toggle terrain contours" aria-pressed={showContours} onClick={() => setShowContours(!showContours)}><Layers3 size={18} /></button>
          <button type="button" aria-label="Reset project map" onClick={() => { setSelected(projects[0]); setShowContours(true); }}><LocateFixed size={18} /></button>
        </div>
      </div>
    </section>
  );
}
