import { pulagElevations } from './pulagElevation';

export type TerrainPosition = { x: number; z: number };
export type MountainView = { yaw: number; pitch: number; zoom: number; lift: number };

type Point3D = { x: number; y: number; z: number };
type ScreenPoint = { x: number; y: number; depth: number };
type Cell = { a: number; b: number; c: number; d: number; shade: string };

const size = pulagElevations.length;
const edge = size - 1;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function elevation({ x, z }: TerrainPosition) {
  const row = Math.min(Math.floor(z), edge - 1);
  const column = Math.min(Math.floor(x), edge - 1);
  const fx = x - column;
  const fz = z - row;
  const near = pulagElevations[row][column] * (1 - fx) + pulagElevations[row][column + 1] * fx;
  const far = pulagElevations[row + 1][column] * (1 - fx) + pulagElevations[row + 1][column + 1] * fx;
  return near * (1 - fz) + far * fz;
}

function vertex(position: TerrainPosition): Point3D {
  return {
    x: (position.x / edge - 0.5) * 4.4,
    y: (elevation(position) - 1000) / 1360,
    z: (position.z / edge - 0.5) * 4.4,
  };
}

const vertices = Array.from({ length: size * size }, (_, index) => vertex({
  x: index % size,
  z: Math.floor(index / size),
}));

const spacing = 4.4 / edge;
const cells: Cell[] = [];
for (let row = 0; row < edge; row++) {
  for (let column = 0; column < edge; column++) {
    const a = row * size + column;
    const b = a + 1;
    const c = b + size;
    const d = a + size;
    const altitude = (vertices[a].y + vertices[b].y + vertices[c].y + vertices[d].y) / 4;
    const slopeX = (vertices[b].y + vertices[c].y - vertices[a].y - vertices[d].y) / (2 * spacing);
    const slopeZ = (vertices[d].y + vertices[c].y - vertices[a].y - vertices[b].y) / (2 * spacing);
    const sun = (-slopeX * 0.64 + 0.56 + slopeZ * 0.53) / Math.hypot(slopeX, 1, slopeZ);
    const tone = clamp(0.36 + sun * 0.45 + altitude * 0.16, 0.06, 0.96);
    const distanceToEdge = Math.min(row + 0.5, column + 0.5, edge - row - 0.5, edge - column - 0.5);
    const coverage = clamp(distanceToEdge / (edge * 0.133));
    // Store lighting, altitude, and border fade in the offscreen raster channels.
    const shade = 'rgb(' + [tone, clamp(altitude / 1.4), coverage].map(value => Math.round(value * 255)).join(',') + ')';
    cells.push({ a, b, c, d, shade });
  }
}

const glyphs = ['.', '·', ':', ';', '+', '=', 'x', '*', 'o', '#', '%', '@'];
const inkDark = ['#293c39', '#395643', '#516b4b', '#728457', '#96a46a', '#b3bc79', '#d7d993', '#f3edb9'];
const inkLight = ['#abb49d', '#929e86', '#77896e', '#657856', '#53684a', '#415a3c', '#30482f', '#203822'];

function makeRoute(positions: readonly TerrainPosition[]) {
  return positions.slice(1).map((end, index) => {
    const start = positions[index];
    return Array.from({ length: 15 }, (_, step) => {
      const t = step / 14;
      const point = vertex({ x: start.x + (end.x - start.x) * t, z: start.z + (end.z - start.z) * t });
      return { ...point, y: point.y + 0.023 };
    });
  });
}

export function createMountainRenderer(canvas: HTMLCanvasElement, light: boolean, positions: readonly TerrainPosition[]) {
  const context = canvas.getContext('2d');
  const sample = document.createElement('canvas');
  const sampleContext = sample.getContext('2d', { willReadFrequently: true });
  if (!context || !sampleContext) return;
  const ctx = context;
  const raster = sampleContext;
  const markers = positions.map((position) => {
    const point = vertex(position);
    return { ...point, y: point.y + 0.023 };
  });
  const trail = makeRoute(positions);
  const ink = light ? inkLight : inkDark;
  const order = [...cells];
  const points = vertices.map<ScreenPoint>(() => ({ x: 0, y: 0, depth: 0 }));
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const compact = width < 740;
    sample.width = Math.max(1, Math.round(width / (compact ? 4.6 : 7)));
    sample.height = Math.max(1, Math.round(height / (compact ? 6.8 : 9.5)));
  }

  function draw(view: MountainView, selected: number, overlayTop?: number) {
    if (!width || !height) return [];

    const cosYaw = Math.cos(view.yaw);
    const sinYaw = Math.sin(view.yaw);
    const cosPitch = Math.cos(view.pitch);
    const sinPitch = Math.sin(view.pitch);
    const compact = width < 740;
    const landscape = height < 530 && width > height;
    const cellWidth = width / sample.width;
    const cellHeight = height / sample.height;

    function projectOffset(point: Point3D, result: ScreenPoint = { x: 0, y: 0, depth: 0 }) {
      const sideways = point.x * cosYaw + point.z * sinYaw;
      const forward = point.z * cosYaw - point.x * sinYaw;
      const distance = forward * cosPitch + point.y * sinPitch;
      const perspective = 1 / (1 - distance * 0.104);
      result.x = sideways * perspective;
      result.y = (forward * sinPitch - point.y * cosPitch) * perspective;
      result.depth = distance;
      return result;
    }

    const offsets = markers.map((point) => projectOffset(point));
    const minX = Math.min(...offsets.map(point => point.x));
    const maxX = Math.max(...offsets.map(point => point.x));
    const minY = Math.min(...offsets.map(point => point.y));
    const maxY = Math.max(...offsets.map(point => point.y));
    const minScreenX = width * (landscape ? 0.40 : compact ? 0.09 : 0.345);
    const maxScreenX = width - Math.min(155, width * (compact ? 0.30 : 0.13));
    const minScreenY = height * (compact && !landscape ? 0.22 : 0.17);
    // Keep the foothill label above the overlaid bio on short portrait screens.
    const portraitBottom = Math.max(minScreenY + 40, Math.min(height * 0.62, (overlayTop ?? height) - 22));
    const maxScreenY = landscape ? height * 0.88 : compact ? portraitBottom : height * 0.855;
    const requestedScale = Math.min(width / (compact ? 3.58 : 5.15), height / (landscape ? 2.5 : 3.22)) * view.zoom;
    const scale = Math.min(requestedScale, (maxScreenX - minScreenX) / (maxX - minX), (maxScreenY - minScreenY) / (maxY - minY));
    const centerX = clamp(width * (landscape ? 0.72 : compact ? 0.58 : 0.70),
      minScreenX - minX * scale, maxScreenX - maxX * scale);
    const centerY = clamp(height * ((compact && !landscape ? 0.43 : 0.59) + view.lift),
      minScreenY - minY * scale, maxScreenY - maxY * scale);

    function toScreen(point: ScreenPoint) {
      point.x = centerX + point.x * scale;
      point.y = centerY + point.y * scale;
      return point;
    }

    for (let i = 0; i < vertices.length; i++) toScreen(projectOffset(vertices[i], points[i]));
    order.sort((first, second) => points[first.a].depth + points[first.c].depth - points[second.a].depth - points[second.c].depth);
    raster.clearRect(0, 0, sample.width, sample.height);
    for (const cell of order) {
      const a = points[cell.a];
      const b = points[cell.b];
      const c = points[cell.c];
      const d = points[cell.d];
      raster.beginPath();
      raster.moveTo(a.x / cellWidth, a.y / cellHeight);
      raster.lineTo(b.x / cellWidth, b.y / cellHeight);
      raster.lineTo(c.x / cellWidth, c.y / cellHeight);
      raster.lineTo(d.x / cellWidth, d.y / cellHeight);
      raster.closePath();
      raster.fillStyle = cell.shade;
      raster.fill();
    }

    const pixels = raster.getImageData(0, 0, sample.width, sample.height).data;
    ctx.clearRect(0, 0, width, height);
    ctx.font = (cellHeight * 1.06).toFixed(2) + 'px "Cascadia Mono", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let row = 0; row < sample.height; row++) {
      for (let column = 0; column < sample.width; column++) {
        const index = (row * sample.width + column) * 4;
        const grain = ((column * 43 + row * 113 + column * row * 7) % 127) / 127;
        const edgeFade = pixels[index + 2] / 255;
        const leftFade = compact ? 1 : clamp((column / sample.width - 0.15) / 0.23);
        if (pixels[index + 3] < 96 || grain >= edgeFade * leftFade) continue;
        const altitude = pixels[index + 1] / 255;
        const tone = clamp((pixels[index] / 255 - 0.15) * 1.13 + (grain - 0.5) * 0.23);
        const inkIndex = Math.round(clamp(tone * 0.82 + altitude * 0.20) * (ink.length - 1));
        ctx.fillStyle = ink[inkIndex];
        ctx.fillText(glyphs[Math.round(tone * (glyphs.length - 1))], (column + 0.5) * cellWidth, (row + 0.5) * cellHeight);
      }
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let index = 0; index < trail.length; index++) {
      const segment = trail[index].map(point => toScreen(projectOffset(point)));
      ctx.beginPath();
      ctx.moveTo(segment[0].x, segment[0].y);
      for (const { x, y } of segment.slice(1)) ctx.lineTo(x, y);
      ctx.lineWidth = 5;
      ctx.strokeStyle = light ? '#edf0df' : '#171d14';
      ctx.stroke();
      ctx.lineWidth = 1.65;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = index < selected ? (light ? '#354e28' : '#e5f59f') : (light ? '#64784b' : '#c0d095');
      ctx.stroke();
      ctx.setLineDash([]);
    }

    return offsets.map(toScreen);
  }

  return { resize, draw };
}
