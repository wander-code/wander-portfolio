import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { checkpoints } from './checkpoints';
import { createMountainRenderer, pulagSummit, type MountainView } from './mountain';
import './mountain.css';

const positions = checkpoints.map(({ position }) => position);
const cameraDuration = 510;

function interpolate(from: MountainView, to: MountainView, progress: number): MountainView {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    zoom: from.zoom + (to.zoom - from.zoom) * progress,
  };
}

export function MountainScene({ light, selected, onSelect }: {
  light: boolean;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const currentView = useRef<MountainView>(checkpoints[0].view);
  const selectView = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const terrain = createMountainRenderer(surface, light, positions, paint);
    if (!terrain) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0;
    let animation = 0;

    function paint() {
      const points = terrain!.draw(currentView.current, active);
      points.forEach(({ x, y }, index) => {
        const marker = markers.current[index];
        if (!marker) return;
        marker.style.left = x.toFixed(1) + 'px';
        marker.style.top = y.toFixed(1) + 'px';
      });
    }

    selectView.current = (index) => {
      active = index;
      window.cancelAnimationFrame(animation);
      const from = currentView.current;
      const to = checkpoints[index].view;
      if (preference.matches || from === to) {
        currentView.current = to;
        paint();
        return;
      }

      const start = performance.now();
      function advance(timestamp: number) {
        const progress = preference.matches ? 1 : Math.min(1, (timestamp - start) / cameraDuration);
        currentView.current = progress === 1 ? to : interpolate(from, to, 1 - (1 - progress) ** 3);
        paint();
        if (progress < 1) animation = window.requestAnimationFrame(advance);
      }
      animation = window.requestAnimationFrame(advance);
    };

    const resize = () => {
      terrain.resize();
      paint();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    resize();

    return () => {
      observer.disconnect();
      terrain.dispose();
      window.cancelAnimationFrame(animation);
      selectView.current = () => {};
    };
  }, [light]);

  useEffect(() => {
    selectView.current(selected);
  }, [light, selected]);

  return (
    <figure className="mountain-scene" aria-label="Mount Pulag milestone trail">
      <div className="mountain-skylight" aria-hidden="true" />
      <canvas
        ref={canvas}
        className="mountain-canvas"
        role="img"
        aria-label="Mount Pulag summit grasslands at dawn, rendered in text characters"
      />
      <figcaption className="mountain-location">
        <strong><MapPin size={15} /> Mount Pulag</strong>
        <span>{pulagSummit.latitude.toFixed(4)}° N / {pulagSummit.longitude.toFixed(4)}° E</span>
      </figcaption>
      <div className="mountain-checkpoints" role="group" aria-label="Trail checkpoints">
        {checkpoints.map((checkpoint, index) => (
          <button
            key={checkpoint.title}
            ref={(element) => { markers.current[index] = element; }}
            type="button"
            className="mountain-checkpoint"
            aria-label={checkpoint.title}
            aria-pressed={selected === index}
            data-reached={index <= selected}
            style={{ left: (19 + index * 8) + '%', top: (82 - index * 13) + '%' }}
            onClick={() => onSelect(index)}
          >
            <span className="checkpoint-dot" aria-hidden="true">{index + 1}</span>
            <span className="checkpoint-label" aria-hidden="true">{checkpoint.label}</span>
          </button>
        ))}
      </div>
      <div className="terrain-credit">
        <a href="https://commons.wikimedia.org/wiki/File:Panoramic_Shot_of_Mt._Pulag_Summit_and_Grassland.jpg" target="_blank" rel="noreferrer">Dawn panorama · Bien02</a>
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
      </div>
    </figure>
  );
}
