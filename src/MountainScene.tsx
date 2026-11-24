import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { checkpoints } from './checkpoints';
import { createMountainRenderer, type MountainView } from './mountain';
import { pulagSummit } from './pulagElevation';
import './mountain.css';

const positions = checkpoints.map(({ position }) => position);
const cameraDuration = 510;

function interpolate(from: MountainView, to: MountainView, progress: number): MountainView {
  return {
    yaw: from.yaw + (to.yaw - from.yaw) * progress,
    pitch: from.pitch + (to.pitch - from.pitch) * progress,
    zoom: from.zoom + (to.zoom - from.zoom) * progress,
    lift: from.lift + (to.lift - from.lift) * progress,
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
    const terrain = createMountainRenderer(surface, light, positions);
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
        aria-label="Mount Pulag rendered in typed characters, with a trail from the foothills to the summit"
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
            <span className="checkpoint-label" aria-hidden="true">{checkpoint.title}</span>
          </button>
        ))}
      </div>
      <a className="terrain-credit" href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noreferrer">Mapzen · SRTM / USGS</a>
    </figure>
  );
}
