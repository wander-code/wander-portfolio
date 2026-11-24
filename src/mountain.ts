import { pulagElevations } from './pulagElevation';

export type TerrainPosition = { x: number; z: number };
export type MountainView = { yaw: number; pitch: number; zoom: number; lift: number };

type ProjectedPoint = { x: number; y: number; depth: number };
type TerrainVertex = { x: number; y: number; z: number };
type TerrainCell = { a: number; b: number; c: number; d: number; shade: string };

const size = pulagElevations.length;
const edge = size - 1;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function summitHeight({ x, z }: TerrainPosition) {
  const row = Math.min(Math.floor(z), edge - 1);
  const column = Math.min(Math.floor(x), edge - 1);
  const dx = x - column;
  const dz = z - row;
  const a = pulagElevations[row][column];
  const b = pulagElevations[row][column + 1];
  const c = pulagElevations[row + 1][column];
  const d = pulagElevations[row + 1][column + 1];
  const altitude = (a * (1 - dx) + b * dx) * (1 - dz) + (c * (1 - dx) + d * dx) * dz;
  const radius = Math.hypot(2 * x / edge - 1, 2 * z / edge - 1);
  const apron = clamp((1.16 - radius) / 0.46);
  return Math.max(0, (altitude - 1330) / 970) * apron ** 1.18;
}

function vertex(point: TerrainPosition): TerrainVertex {
  return {
    x: (2 * point.x / edge - 1) * 1.67,
    y: summitHeight(point) * 1.2,
    z: (2 * point.z / edge - 1) * 1.52,
  };
}

const vertices = Array.from({ length: size * size }, (_, index) => vertex({
  x: index % size,
  z: Math.floor(index / size),
}));

const cells: TerrainCell[] = [];
for (let row = 0; row < edge; row++) {
  for (let col = 0; col < edge; col++) {
    const a = row * size + col;
    const b = a + 1;
    const c = b + size;
    const d = a + size;
    const height = (vertices[a].y + vertices[b].y + vertices[c].y + vertices[d].y) / 4;
    if (height < 0.04) continue;

    const slopeX = (vertices[b].y + vertices[c].y - vertices[a].y - vertices[d].y) * edge / 6.68;
    const slopeZ = (vertices[d].y + vertices[c].y - vertices[a].y - vertices[b].y) * edge / 6.08;
    const lighting = (-0.67 * slopeX + 0.64 - 0.38 * slopeZ) / Math.hypot(slopeX, 1, slopeZ);
    const shade = Math.round(clamp(0.21 + lighting * 0.48 + height * 0.233, 0.04, 0.98) * 255);
    cells.push({ a, b, c, d, shade: 'rgb(' + shade + ',' + shade + ',' + shade + ')' });
  }
}

const glyphs = ['.', ':', ';', '·', '+', '=', 'x', '*', 'o', '#', '%', '@'];
const mossInk = ['#425b51', '#52735d', '#688b67', '#81a572', '#a0bb7b', '#b8d68c', '#dcebb0', '#eff2c8'];
const lightInk = ['#809286', '#73866f', '#60775f', '#526e53', '#426242', '#345537', '#284630', '#243b2b'];

function trailBetween(positions: readonly TerrainPosition[]) {
  return positions.slice(1).map((end, index) => {
    const start = positions[index];
    return Array.from({ length: 15 }, (_, step) => {
      const m = step / 14;
      const x = start.x + (end.x - start.x) * m;
      const z = start.z + (end.z - start.z) * m;
      const point = vertex({ x, z });
      return { ...point, y: point.y + 0.019 };
    });
  });
}

export function createMountainRenderer(
  canvas: HTMLCanvasElement,
  light: boolean,
  positions: readonly TerrainPosition[],
) {
  const context = canvas.getContext('2d');
  const sample = document.createElement('canvas');
  const sampler = sample.getContext('2d', { willReadFrequently: true });
  if (!context || !sampler) return;
  const ctx = context;
  const raster = sampler;

  const trail = trailBetween(positions);
  const markers = positions.map((point) => {
    const anchor = vertex(point);
    return { ...anchor, y: anchor.y + 0.019 };
  });
  const ink = light ? lightInk : mossInk;
  const order = [...cells];
  const points: ProjectedPoint[] = vertices.map(() => ({ x: 0, y: 0, depth: 0 }));
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const compact = width < 530;
    sample.width = Math.max(1, Math.round(width / (compact ? 4.75 : 6.3)));
    sample.height = Math.max(1, Math.round(height / (compact ? 6.75 : 8.5)));
  }

  function draw(view: MountainView, selected: number) {
    if (!width || !height) return [];

    const cosYaw = Math.cos(view.yaw);
    const sinYaw = Math.sin(view.yaw);
    const cosPitch = Math.cos(view.pitch);
    const sinPitch = Math.sin(view.pitch);
    const preferredScale = Math.min(width / 4.18, height / 2.37) * view.zoom;
    const centerX = width * 0.52;
    const centerY = height * ((width < 530 ? 0.605 : 0.655) + view.lift * 0.65);
    const glyphWidth = width / sample.width;
    const glyphHeight = height / sample.height;

    function projectOffset(point: TerrainVertex, result: ProjectedPoint = { x: 0, y: 0, depth: 0 }) {
      const sideways = point.x * cosYaw + point.z * sinYaw;
      const forward = point.z * cosYaw - point.x * sinYaw;
      result.depth = forward * cosPitch + point.y * sinPitch;
      const perspective = 1 / (1 - result.depth * 0.1);
      result.x = sideways * perspective;
      result.y = (forward * sinPitch - point.y * cosPitch) * perspective;
      return result;
    }

    raster.clearRect(0, 0, sample.width, sample.height);
    let west = 0;
    let east = 0;
    let north = 0;
    let south = 0;
    for (let i = 0; i < vertices.length; i++) {
      const point = projectOffset(vertices[i], points[i]);
      if (vertices[i].y < 0.035) continue;
      west = Math.min(west, point.x);
      east = Math.max(east, point.x);
      north = Math.min(north, point.y);
      south = Math.max(south, point.y);
    }

    const topInset = Math.min(height * 0.21, 66);
    const bottomInset = Math.min(height * 0.1, 32);
    const sideInset = Math.min(width * 0.035, 25);
    const scale = Math.min(
      preferredScale,
      (centerX - sideInset) / Math.max(-west, 0.01),
      (width - centerX - sideInset) / Math.max(east, 0.01),
      (centerY - topInset) / Math.max(-north, 0.01),
      (height - centerY - bottomInset) / Math.max(south, 0.01),
    );

    function toScreen(point: ProjectedPoint) {
      point.x = centerX + point.x * scale;
      point.y = centerY + point.y * scale;
      return point;
    }

    function project(point: TerrainVertex) {
      return toScreen(projectOffset(point));
    }

    for (const point of points) toScreen(point);
    order.sort((first, second) => points[first.a].depth + points[first.c].depth - points[second.a].depth - points[second.c].depth);

    for (const cell of order) {
      const a = points[cell.a];
      const b = points[cell.b];
      const c = points[cell.c];
      const d = points[cell.d];
      raster.beginPath();
      raster.moveTo(a.x / glyphWidth, a.y / glyphHeight);
      raster.lineTo(b.x / glyphWidth, b.y / glyphHeight);
      raster.lineTo(c.x / glyphWidth, c.y / glyphHeight);
      raster.lineTo(d.x / glyphWidth, d.y / glyphHeight);
      raster.closePath();
      raster.fillStyle = cell.shade;
      raster.fill();
    }

    const pixels = raster.getImageData(0, 0, sample.width, sample.height).data;
    ctx.clearRect(0, 0, width, height);
    ctx.font = (glyphHeight * 1.04).toFixed(2) + 'px "Cascadia Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < sample.height; row++) {
      for (let col = 0; col < sample.width; col++) {
        const p = (row * sample.width + col) * 4;
        if (pixels[p + 3] < 0.37 * 255) continue;
        const grain = ((col * 53 + row * 151 + col * row * 7) % 97) / 97;
        const tone = clamp(pixels[p] / 255 + (grain - 0.5) * 0.24);
        const glyph = glyphs[Math.min(glyphs.length - 1, Math.round(tone * (glyphs.length - 1)))];
        if (tone < 0.22 && grain < 0.35) continue;
        ctx.fillStyle = ink[Math.min(ink.length - 1, Math.round(tone * (ink.length - 1)))];
        ctx.fillText(glyph, (col + 0.5) * glyphWidth, (row + 0.5) * glyphHeight);
      }
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < trail.length; i++) {
      const route = trail[i].map((point) => project(point));
      ctx.beginPath();
      ctx.moveTo(route[0].x, route[0].y);
      for (const { x, y } of route.slice(1)) ctx.lineTo(x, y);
      ctx.lineWidth = 3.3;
      ctx.strokeStyle = light ? '#e0ebd6' : '#111a19';
      ctx.stroke();
      ctx.lineWidth = 1.25;
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = i < selected
        ? (light ? '#334b24' : '#dbef8f')
        : (light ? '#72905c' : '#95a87b');
      ctx.stroke();
      ctx.setLineDash([]);
    }

    return markers.map((point) => project(point));
  }

  return { resize, draw };
}
