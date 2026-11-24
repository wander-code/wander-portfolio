import { ChevronLeft, ChevronRight, Compass, LocateFixed } from 'lucide-react';
import { useEffect, useRef, type RefObject } from 'react';
import { createMountainRenderer, type MountainView } from './mountain';
import './mountain.css';

const restView: MountainView = { yaw: -0.26, pitch: 0.45 };

export function MountainScene({ light, hero }: { light: boolean; hero: RefObject<HTMLElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef<(direction: -1 | 0 | 1) => void>(() => {});
  const bearing = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const frame = hero.current;
    if (!surface || !frame) return;
    const terrain = createMountainRenderer(surface, light);
    if (!terrain) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = { ...restView };
    let base = { ...restView };
    let target = { ...restView };
    let animation = 0;
    let drag: { id: number; x: number; yaw: number } | undefined;

    function animate() {
      const offsetYaw = target.yaw - current.yaw;
      const offsetPitch = target.pitch - current.pitch;
      const settled = Math.abs(offsetYaw) + Math.abs(offsetPitch) < 0.003;
      const ease = settled || preference.matches ? 1 : 0.19;
      current.yaw += offsetYaw * ease;
      current.pitch += offsetPitch * ease;
      terrain?.draw(current);

      if (bearing.current) {
        const angle = (Math.round(current.yaw * 180 / Math.PI) + 360) % 360;
        bearing.current.textContent = String(angle).padStart(3, '0') + '°';
      }
      animation = !settled && !preference.matches ? window.requestAnimationFrame(animate) : 0;
    }

    function requestDraw() {
      if (!animation) animation = window.requestAnimationFrame(animate);
    }

    function move(event: PointerEvent) {
      if (drag?.id === event.pointerId) {
        base.yaw = Math.max(-1.05, Math.min(0.89, drag.yaw + (event.clientX - drag.x) * 0.006));
        target = { ...base };
        requestDraw();
        return;
      }

      const overControl = event.target instanceof Element && event.target.closest('a, button');
      if (event.pointerType !== 'mouse' || preference.matches || overControl) return;
      const bounds = frame!.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      target = { yaw: base.yaw + x * 0.77, pitch: base.pitch - y * 0.39 };
      requestDraw();
    }

    function leave() {
      if (drag) return;
      target = { ...base };
      requestDraw();
    }

    function startDrag(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, yaw: current.yaw };
      surface!.setPointerCapture(event.pointerId);
    }

    function finishDrag(event: PointerEvent) {
      if (drag?.id !== event.pointerId) return;
      drag = undefined;
      if (surface!.hasPointerCapture(event.pointerId)) surface!.releasePointerCapture(event.pointerId);
    }

    controls.current = (direction) => {
      base = direction === 0 ? { ...restView } : {
        ...base,
        yaw: Math.max(-1.05, Math.min(0.89, base.yaw + direction * 0.26)),
      };
      target = { ...base };
      requestDraw();
    };

    const observer = new ResizeObserver(() => {
      terrain.resize();
      requestDraw();
    });
    observer.observe(surface);
    terrain.resize();
    requestDraw();

    frame.addEventListener('pointermove', move);
    frame.addEventListener('pointerleave', leave);
    surface.addEventListener('pointerdown', startDrag);
    surface.addEventListener('pointerup', finishDrag);
    surface.addEventListener('pointercancel', finishDrag);
    surface.addEventListener('lostpointercapture', finishDrag);
    preference.addEventListener('change', leave);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animation);
      frame.removeEventListener('pointermove', move);
      frame.removeEventListener('pointerleave', leave);
      surface.removeEventListener('pointerdown', startDrag);
      surface.removeEventListener('pointerup', finishDrag);
      surface.removeEventListener('pointercancel', finishDrag);
      surface.removeEventListener('lostpointercapture', finishDrag);
      preference.removeEventListener('change', leave);
      controls.current = () => {};
    };
  }, [hero, light]);

  return (
    <figure className="mountain-scene">
      <div className="mountain-skylight" aria-hidden="true" />
      <div className="mountain-crosshair crosshair-top" aria-hidden="true">+</div>
      <div className="mountain-crosshair crosshair-bottom" aria-hidden="true">+</div>
      <canvas
        ref={canvas}
        className="mountain-canvas"
        role="img"
        aria-label="A three-dimensional mountain rendered from small colored squares"
      />
      <div className="mountain-bearing" aria-hidden="true"><Compass size={16} /><span ref={bearing}>345°</span></div>
      <figcaption className="mountain-caption">
        <span className="mountain-hint">
          <span className="pointer-hint">Move your pointer to tilt the mountain</span>
          <span className="touch-hint">Drag sideways to rotate the mountain</span>
          <span className="motion-hint">Use the controls to rotate the mountain</span>
        </span>
        <div className="mountain-controls" role="group" aria-label="Mountain view">
          <button type="button" aria-label="Rotate mountain left" onClick={() => controls.current(-1)}><ChevronLeft size={19} /></button>
          <button type="button" aria-label="Reset mountain view" onClick={() => controls.current(0)}><LocateFixed size={16} /></button>
          <button type="button" aria-label="Rotate mountain right" onClick={() => controls.current(1)}><ChevronRight size={19} /></button>
        </div>
      </figcaption>
    </figure>
  );
}
